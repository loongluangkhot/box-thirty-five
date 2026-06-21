/* ============================================================
   App.jsx — root state, routing, card-arrival events, saves
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from "react";
import { LOCATIONS, ANSWER, OUTCOMES } from "./data.js";
import { CardModal } from "./cards.jsx";
import { HUD, ToastHost } from "./components.jsx";
import {
  IntroScreen, HubScreen, LocationScreen, CardsScreen,
  StakeoutScreen, OutcomeScreen, VaultScene, FinaleScene, capId,
} from "./screens.jsx";
import { WishesScene } from "./wishes.jsx";

const SAVE_KEY = "box35-save-v3";

const VALID_SCREENS = new Set([
  "intro", "hub", "cards", "stakeout", "outcome", "vault", "finale", "wishes",
  ...LOCATIONS.map((l) => l.id),
]);
const screenFromHash = () => {
  const h = window.location.hash.replace(/^#\/?/, "");
  return VALID_SCREENS.has(h) ? h : null;
};

function initialState() {
  return {
    screen: "intro",
    day: 6,
    flags: {},                         // evidence + asked flags
    done: {},                          // { locId: { hsId:true } }
    cards: [],
    unlocked: { bank: true, vesna: true, yard: true },
    hasFailed: false,
    lastNudge: "",
    outcome: null,
    sound: false,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch (e) {}
  return initialState();
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [toasts, setToasts] = useState([]);
  const [modalCard, setModalCard] = useState(null);
  const toastId = useRef(0);

  // persist (everything but transient UI)
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  // Initial URL ↔ state sync: URL wins if it names a valid, accessible screen.
  useEffect(() => {
    const fromHash = screenFromHash();
    if (fromHash && fromHash !== state.screen) {
      const loc = LOCATIONS.find((l) => l.id === fromHash);
      const blocked = loc && loc.locked && !state.unlocked[fromHash];
      if (!blocked) {
        setState((s) => ({ ...s, screen: fromHash }));
        return;
      }
    }
    window.history.replaceState(null, "", `#/${state.screen}`);
  }, []);

  // Push a history entry whenever the screen changes (skipped on the initial
  // mount because the sync effect above already aligned the hash).
  useEffect(() => {
    const target = `#/${state.screen}`;
    if (window.location.hash !== target) {
      window.history.pushState(null, "", target);
    }
  }, [state.screen]);

  // Browser back/forward → set screen from URL; refuse to land on locked locations.
  useEffect(() => {
    const onPop = () => {
      const next = screenFromHash() || "intro";
      setState((s) => {
        if (s.screen === next) return s;
        const loc = LOCATIONS.find((l) => l.id === next);
        if (loc && loc.locked && !s.unlocked[next]) {
          window.history.replaceState(null, "", "#/hub");
          return { ...s, screen: "hub" };
        }
        return { ...s, screen: next };
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const addToast = useCallback((title, msg) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, title, msg }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 5200);
  }, []);
  const dismissToast = (id) => setToasts((ts) => ts.filter((t) => t.id !== id));

  /* ---- helpers ---- */
  const has = (f) => !!state.flags[f];
  const met = (req) => {
    if (!req) return true;
    if (Array.isArray(req)) return req.every((r) => state.flags[r]);
    return !!state.flags[req];
  };

  // Apply a batch of effects to a draft, returning toasts to fire after.
  function applyEffects(draft, effects, addCard) {
    const fire = [];
    if (addCard && !draft.cards.includes(addCard)) draft.cards = [...draft.cards, addCard];
    if (effects) {
      if (effects.set) { draft.flags = { ...draft.flags }; effects.set.forEach((f) => (draft.flags[f] = true)); }
      if (effects.addCards) {
        effects.addCards.forEach((c) => { if (!draft.cards.includes(c)) draft.cards = [...draft.cards, c]; });
      }
      if (effects.unlock) { draft.unlocked = { ...draft.unlocked }; effects.unlock.forEach((u) => (draft.unlocked[u] = true)); }
      if (effects.toast) fire.push(effects.toast);
    }
    return fire;
  }

  const go = (screen) => setState((s) => ({ ...s, screen }));

  const travel = (locId) => {
    const loc = LOCATIONS.find((l) => l.id === locId);
    if (loc.locked && !state.unlocked[locId]) return;
    setState((s) => ({ ...s, screen: locId }));
  };

  const doHotspot = (loc, hs) => {
    if (state.done[loc.id]?.[hs.id]) return; // already done — row already shows reveal
    if (hs.requires && !has(hs.requires)) return;
    setState((s) => {
      const draft = { ...s };
      draft.done = { ...draft.done, [loc.id]: { ...(draft.done[loc.id] || {}), [hs.id]: true } };
      const fire = applyEffects(draft, hs.effects, hs.addCard);
      setTimeout(() => fire.forEach((t) => addToast(t.title, t.msg)), 30);
      return draft;
    });
  };

  const ask = (loc, d) => {
    const askedFlag = "asked" + capId(d.id);
    if (state.flags[askedFlag]) return;
    if (!met(d.requires)) return;
    setState((s) => {
      const draft = { ...s, flags: { ...s.flags, [askedFlag]: true } };
      const fire = applyEffects(draft, d.effects, null);
      setTimeout(() => fire.forEach((t) => addToast(t.title, t.msg)), 30);
      return draft;
    });
  };

  const commitStakeout = (night, hour) => {
    const A = ANSWER;
    let outcome = null;
    if (night !== A.night) outcome = { key: "wrongNight" };
    else if (hour === A.trapHour) outcome = { key: "trapHour" };
    else if (hour !== A.hour) outcome = { key: "wrongHour" };
    if (!outcome) { setState((s) => ({ ...s, screen: "vault" })); return; }
    setState((s) => ({ ...s, screen: "outcome", outcome, hasFailed: true, lastNudge: OUTCOMES[outcome.key].q }));
  };

  const reorderCards = (next) => setState((s) => ({ ...s, cards: next }));
  const restart = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} setState(initialState()); setToasts([]); setModalCard(null); };

  const locStatus = (loc) => {
    if (loc.locked && !state.unlocked[loc.id]) return "locked";
    const allHs = (loc.hotspots || []).every((h) => state.done[loc.id]?.[h.id]);
    const allDlg = (loc.dialogue || []).every((d) => state.flags["asked" + capId(d.id)]);
    return allHs && allDlg ? "done" : "idle";
  };

  const ctx = {
    state,
    cards: state.cards,
    unlockedCount: Object.values(state.unlocked).filter(Boolean).length,
    go, travel, has, met,
    hotspotDone: (locId, hsId) => !!state.done[locId]?.[hsId],
    doHotspot, ask, commitStakeout, reorderCards, restart, locStatus,
    openCard: (item, caption) => setModalCard({ item, caption }),
  };

  // route
  let Screen;
  const s = state.screen;
  if (s === "intro") Screen = <IntroScreen ctx={ctx} />;
  else if (s === "hub") Screen = <HubScreen ctx={ctx} />;
  else if (s === "cards") Screen = <CardsScreen ctx={ctx} />;
  else if (s === "stakeout") Screen = <StakeoutScreen ctx={ctx} />;
  else if (s === "outcome") Screen = <OutcomeScreen ctx={ctx} />;
  else if (s === "vault") Screen = <VaultScene ctx={ctx} />;
  else if (s === "finale") Screen = <FinaleScene ctx={ctx} />;
  else if (s === "wishes") Screen = <WishesScene ctx={ctx} />;
  else Screen = <LocationScreen ctx={ctx} />;

  const showHud = s !== "intro";
  const inWishes = s === "wishes";

  return (
    <div className={`stage${inWishes ? " stage--wishes" : ""}`}>
      {showHud && (
        <HUD day={state.day} sound={state.sound}
          hideDay={inWishes}
          onSound={() => setState((st) => ({ ...st, sound: !st.sound }))}
          onTitle={() => go("intro")}
          onRestart={() => { if (confirm("Restart the case from the beginning?")) restart(); }} />
      )}
      {Screen}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      {modalCard && <CardModal item={modalCard.item} caption={modalCard.caption} onClose={() => setModalCard(null)} />}
      {state.sound && <Ambience />}
    </div>
  );
}

/* tiny optional ambience: a low rain-ish noise bed via WebAudio, gated by the toggle */
function Ambience() {
  useEffect(() => {
    let ctx, src, gain;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = 2 * ctx.sampleRate;
      const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.2; }
      src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 720;
      gain = ctx.createGain(); gain.gain.value = 0.0;
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      src.start();
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2);
    } catch (e) {}
    return () => { try { gain && gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); setTimeout(() => ctx && ctx.close(), 400); } catch (e) {} };
  }, []);
  return null;
}
