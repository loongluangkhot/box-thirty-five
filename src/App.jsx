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
import { setMusicPlayer } from "./ambience.js";

const SAVE_KEY = "box35-save-v3";

const VALID_SCREENS = new Set([
  "intro", "hub", "cards", "stakeout", "outcome", "vault", "finale", "wishes",
  ...LOCATIONS.map((l) => l.id),
]);
const screenFromHash = () => {
  // Only the first path segment selects the screen; the rest is owned by
  // the screen itself (e.g. "#/wishes/3" is still the wishes screen).
  const h = window.location.hash.replace(/^#\/?/, "").split("/")[0];
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
    if (raw) {
      // `screen` is persisted so a refresh keeps you on the same page, but a
      // fresh visit to "/" should always start at intro rather than dropping
      // you back where you last were.
      const { screen, ...rest } = JSON.parse(raw);
      return { ...initialState(), ...rest };
    }
  } catch (e) {}
  return initialState();
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [toasts, setToasts] = useState([]);
  const [modalCard, setModalCard] = useState(null);
  const [duckAmbience, setDuckAmbience] = useState(false);
  const toastId = useRef(0);

  // Duck the ambience while any user-played audio/video with sound is playing.
  // `play` / `pause` / `ended` don't bubble, so we listen in the capture phase.
  useEffect(() => {
    const live = new Set();
    const sync = () => setDuckAmbience(live.size > 0);
    const onPlay = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLMediaElement)) return;
      if (el.muted) return;                    // muted autoplay (e.g. the vault videos) shouldn't duck
      live.add(el);
      sync();
    };
    const onStop = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLMediaElement)) return;
      if (live.delete(el)) sync();
    };
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
    };
  }, []);

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
  // mount because the sync effect above already aligned the hash). We only
  // care about the first segment — preserving any screen-owned subpath.
  useEffect(() => {
    const currentScreen = window.location.hash.replace(/^#\/?/, "").split("/")[0];
    if (currentScreen !== state.screen) {
      window.history.pushState(null, "", `#/${state.screen}`);
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

  const inWishes = s === "wishes";

  return (
    <div className={`stage${inWishes ? " stage--wishes" : ""}`}>
      <HUD day={state.day} sound={state.sound}
        hideDay={inWishes}
        onSound={() => setState((st) => ({ ...st, sound: !st.sound }))}
        onTitle={() => go("intro")}
        onRestart={() => { if (confirm("Restart the case from the beginning?")) restart(); }} />
      {Screen}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      {modalCard && <CardModal item={modalCard.item} caption={modalCard.caption} onClose={() => setModalCard(null)} />}
      <Ambience videoId={inWishes ? "o_UfJHtmFOY" : "qYaKzpMdBaM"} playing={state.sound && !duckAmbience} />
    </div>
  );
}

/* Optional ambience: a looping YouTube stream gated by the HUD toggle.
   The iframe mounts ONCE — we swap tracks via the YT API (loadVideoById /
   cueVideoById) rather than re-mounting. Re-mounting via `key={videoId}`
   raced two effects: the iframeReady reset queued for the next render
   while the player-init effect ran with the stale `true`, so two YT.Players
   ended up claiming the same iframe and `onReady` for the live one never
   fired — leaving the mute toggle dead on the wishes page.

   We wrap the iframe in a YT.Player so callers (e.g. the wishes
   bobbleheads) can read getCurrentTime() and phase-lock to the music. */
function Ambience({ videoId, playing }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  // Freeze the videoId used in the iframe src so the iframe never re-mounts.
  // Subsequent changes to `videoId` are applied via the YT API below.
  const initialVideoId = useRef(videoId).current;
  const loadedVideoId = useRef(initialVideoId);

  // Load the YT IFrame API script once for the whole app.
  useEffect(() => {
    if (window.YT?.Player) return;
    if (document.querySelector("script[data-yt-api]")) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.dataset.ytApi = "1";
    document.body.appendChild(tag);
  }, []);

  // Wrap the iframe in a YT.Player once — the YT API tolerates an iframe
  // whose content is still loading; onReady fires when it's actually ready.
  useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (cancelled || !iframeRef.current) return;
      new window.YT.Player(iframeRef.current, {
        events: {
          onReady: (e) => {
            if (cancelled) return;
            e.target.setVolume(20);
            playerRef.current = e.target;
            setMusicPlayer(e.target);
            setPlayerReady(true);
          },
          onStateChange: (e) => {
            // 0 = ENDED. loadVideoById drops the iframe's loop=1 setting, so
            // we restart manually to keep the ambience continuous after a swap.
            if (e.data === 0) e.target.playVideo();
          },
        },
      });
    };
    if (window.YT?.Player) {
      init();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); init(); };
    }
    return () => {
      cancelled = true;
      playerRef.current = null;
      setMusicPlayer(null);
    };
  }, []);

  // Swap tracks via the YT API when videoId changes. `loadedVideoId` starts
  // at `initialVideoId` (what the iframe src loaded), so the first run is a
  // no-op when the desired track still matches.
  useEffect(() => {
    if (!playerReady) return;
    if (videoId === loadedVideoId.current) return;
    const p = playerRef.current;
    if (!p) return;
    try {
      if (playing) p.loadVideoById(videoId);
      else p.cueVideoById(videoId);
      loadedVideoId.current = videoId;
    } catch (e) {}
  }, [videoId, playerReady]);

  // Drive play/pause off the YT.Player once it's ready. Initial state is
  // applied here too (covers the case where `playing` was already true at
  // mount time — pre-onReady postMessage commands get dropped).
  //
  // After a refresh the persisted state.sound may be true but the browser
  // hasn't seen a user gesture yet, so our playVideo() call may be silently
  // blocked. Attach a one-shot gesture catcher that retries on the first
  // interaction; if play already succeeded, the retry is a harmless no-op.
  useEffect(() => {
    if (!playerReady) return;
    const p = playerRef.current;
    if (!p) return;
    try {
      if (playing) p.playVideo(); else p.pauseVideo();
    } catch (e) {}
    if (!playing) return;
    const onGesture = () => {
      try {
        // YT.PlayerState.PLAYING === 1. Skip the retry if we're already
        // playing so a user-initiated mute-toggle click doesn't briefly
        // re-trigger playback before the pause goes through.
        if (p.getPlayerState() !== 1) p.playVideo();
      } catch (e) {}
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
      window.removeEventListener("touchstart", onGesture, true);
    };
    window.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("keydown", onGesture, true);
    window.addEventListener("touchstart", onGesture, true);
    return cleanup;
  }, [playing, playerReady]);

  // No `autoplay=1` — we drive playback exclusively via the YT API so the
  // muted state on load doesn't get bypassed by the browser's autoplay grant.
  const src = `https://www.youtube.com/embed/${initialVideoId}`
    + `?loop=1&playlist=${initialVideoId}`
    + `&controls=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="Ambient music"
      allow="autoplay; encrypted-media"
      style={{
        position: "fixed", left: "-9999px", top: "-9999px",
        width: 200, height: 120, border: 0,
        opacity: 0, pointerEvents: "none",
      }}
    />
  );
}
