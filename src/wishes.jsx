/* ============================================================
   wishes.jsx — Box Thirty-Five · the mantel of birthday cards.
   One card per person. Open it to read what they sent.
   ============================================================ */
import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { getMusicPlayer } from "./ambience.js";

const FacesContext = createContext([]);

/* Wishes ambience track is 137 bpm. The rAF loop in WishesScene reads
   currentTime off the YT.Player on every frame and writes 4 variant
   sets of CSS vars (--bob-y/r/s-0..3); each .m-face picks one variant
   via className so the mantel reads as a crowd of distinct dancers all
   locked to the same beat. YT.Player getters are cached internally so
   polling every frame is cheap. */
const BPM = 137;
const BEAT_SECONDS = 60 / BPM;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PUNS = [
  "Aged to perfection",
  "Another lap around the sun",
  "Officially a classic",
  "Older, but no wiser",
  "Level thirty‑five unlocked",
  "Wrinkles? Laugh lines.",
  "Fully ripened",
  "Best of luck to your lower back this year.",
  "Still a rockstar. Just in bed by 9 PM.",
  "Older? Yes. Grown up? Never.",
  "Another year closer to senior discounts.",
  "Still doing stupid things, just slower.",
  "Another year of successfully faking adulthood.",
  "Spoiler alert: You’re older.",
];

function Motif({ v }) {
  const faces = useContext(FacesContext);
  if (!faces.length) return null;
  const name = faces[((v % faces.length) + faces.length) % faces.length];
  // 4 bobble variations (on-beat right/left, off-beat, half-time) assigned
  // deterministically per slot so the mantel reads as a mixed crowd dancing.
  const variant = ((v % 4) + 4) % 4;
  return <img className={`m-face m-face--${variant}`} src={`/faces/${name}`} alt="" />;
}

function CardFront({ p, idx, onOpen }) {
  return (
    <button className="bcard" onClick={() => onOpen(idx)}>
      <div className={"bcard__cover paper-" + (p.slot % 3)}>
        <span className="bcard__motif"><Motif v={p.slot} /></span>
        <div className="bcard__greet">
          Happy Birthday
          <small>{PUNS[p.slot % PUNS.length]}</small>
        </div>
        <div className="bcard__sender">
          <div className="bcard__name">{p.name}</div>
        </div>
      </div>
    </button>
  );
}

const mdCache = new Map();
function loadMd(src) {
  if (!mdCache.has(src)) {
    mdCache.set(src, fetch(src).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${src}: ${r.status}`);
      return r.text();
    }));
  }
  return mdCache.get(src);
}

function TextItem({ item }) {
  const [body, setBody] = useState(item.src ? "" : (item.body || ""));
  const [loading, setLoading] = useState(!!item.src);

  useEffect(() => {
    if (!item.src) return;
    let cancelled = false;
    setLoading(true);
    loadMd(item.src).then(
      (t) => { if (!cancelled) { setBody(t); setLoading(false); } },
      () => { if (!cancelled) { setBody(item.body || ""); setLoading(false); } },
    );
    return () => { cancelled = true; };
  }, [item.src]);

  const paragraphs = body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="cv-item cv-note">
      <div className="cv-body">
        {loading
          ? <span className="cv-loading">…</span>
          : paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {item.from && <div className="cv-sign">{item.from}</div>}
    </div>
  );
}

function CanvasItem({ item }) {
  if (item.type === "text") {
    return <TextItem item={item} />;
  }
  if (item.type === "photo") {
    return (
      <div className={"cv-item cv-photo" + (item.src ? " cv-photo--src" : "")}>
        <div className={"frame" + (item.src ? "" : " ph ph--photo")}>
          {item.src
            ? <img src={item.src} alt={item.label || ""} />
            : <span className="ph__tag">Photo · drop file</span>}
        </div>
        {item.label && <figcaption className="cv-cap">{item.label}</figcaption>}
      </div>
    );
  }
  if (item.type === "audio") {
    return (
      <div className="cv-item cv-voice">
        <div className="voice-card">
          {item.src ? (
            <audio controls src={item.src}></audio>
          ) : (
            <>
              <span className="voice__play">▶</span>
              <span className="voice__wave">
                {Array.from({ length: 44 }).map((_, k) => (
                  <i
                    key={k}
                    className={k < 15 ? "is-played" : ""}
                    style={{ height: (26 + Math.abs(Math.sin(k * 0.7 + 1)) * 60) + "%" }}
                  ></i>
                ))}
              </span>
              <span className="voice__time"><b>0:00</b> / {item.duration || "0:00"}</span>
            </>
          )}
        </div>
        <figcaption className="cv-cap">
          {item.label || "Voice note"}
          {item.from && <span className="cv-cap__by"> — {item.from}</span>}
          {!item.src && " · drop audio"}
        </figcaption>
      </div>
    );
  }
  if (item.type === "video") {
    return (
      <div className={"cv-item cv-video" + (item.src ? " cv-video--src" : "")}>
        <div className={"frame" + (item.src ? "" : " ph ph--video")}>
          {item.src
            ? <video
                controls
                src={item.src}
                autoPlay={!!item.autoplay}
                muted={!!item.autoplay}
                playsInline={!!item.autoplay}
                loop={!!item.loop}
              ></video>
            : <><span className="play-tri"></span><span className="ph__tag ph__tag--btm">Video · drop file</span></>}
        </div>
        {item.label && <figcaption className="cv-cap">{item.label}</figcaption>}
      </div>
    );
  }
  return null;
}

/* Group consecutive photo/video items so they can flow side-by-side.
   Text and audio always sit on their own row. */
function groupItems(items) {
  const out = [];
  let row = null;
  const flowable = (t) => t === "photo" || t === "video";
  for (const it of items) {
    if (flowable(it.type)) {
      if (!row) { row = { kind: "row", items: [] }; out.push(row); }
      row.items.push(it);
    } else {
      row = null;
      out.push({ kind: "single", item: it });
    }
  }
  return out;
}

function OpenCard({ p, idx, total, onClose, onPrev, onNext }) {
  return (
    <div className="card-scrim" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-modal__bar">
          <div className="card-modal__title">
            <svg className="namecake" viewBox="0 0 30 30" fill="none"
                 stroke="currentColor" strokeWidth="1.4"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* Wrapper: gently tapered trapezoid */}
              <path d="M 9.5 18 L 10.8 26.5 L 19.2 26.5 L 20.5 18 Z" fill="var(--accent-soft)" />
              {/* Wrapper rim */}
              <line x1="9.5" y1="18" x2="20.5" y2="18" />
              {/* Wrapper flutes */}
              <line x1="13" y1="18.5" x2="13.4" y2="26" />
              <line x1="15" y1="18.5" x2="15" y2="26" />
              <line x1="17" y1="18.5" x2="16.6" y2="26" />
              {/* Frosting: mushroom dome wider than the wrapper rim */}
              <path d="M 7 18
                       Q 5.5 13, 10.5 12
                       Q 11.5 8.5, 15 8.5
                       Q 18.5 8.5, 19.5 12
                       Q 24.5 13, 23 18 Z"
                    fill="var(--accent-soft)" />
              {/* Candle */}
              <line x1="15" y1="4.5" x2="15" y2="9" strokeWidth="1.6" />
              {/* Teardrop flame */}
              <path d="M 15 1.2 C 12.7 3, 12.7 4.3, 15 4.5 C 17.3 4.3, 17.3 3, 15 1.2 Z"
                    fill="currentColor" stroke="none" />
            </svg>
            <h2>{p.name}</h2>
          </div>
          <div className="card-modal__nav">
            <button className="iconbtn" onClick={onPrev} title="Previous card">‹</button>
            <span className="card-modal__count">{idx + 1} / {total}</span>
            <button className="iconbtn" onClick={onNext} title="Next card">›</button>
            <button className="iconbtn" onClick={onClose} title="Close (Esc)">✕</button>
          </div>
        </div>

        <div className="canvas" key={idx}>
          <div className="canvas__head">
            <span className="bcard__motif"><Motif v={p.slot % 10} /></span>
            <div className="canvas__eyebrow">Happy Birthday, Nic</div>
          </div>

          <div className="canvas__body">
            {groupItems(p.items).map((g, i) =>
              g.kind === "row"
                ? (
                  <div key={i} className="cv-row">
                    {g.items.map((it, j) => <CanvasItem key={j} item={it} />)}
                  </div>
                )
                : <CanvasItem key={i} item={g.item} />
            )}
          </div>

          <div className="canvas__foot">With love, {p.name}</div>
        </div>
      </div>
    </div>
  );
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function parseCardSlug() {
  const m = window.location.hash.match(/^#\/wishes\/([^/]+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function WishesScene({ ctx }) {
  const [wishes, setWishes] = useState(null);
  const [faces, setFaces] = useState([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/wishes/manifest.json").then((r) => r.json()),
      fetch("/faces/manifest.json").then((r) => r.json()),
    ]).then(([wishesData, facesData]) => {
      if (cancelled) return;
      setWishes(wishesData);
      setFaces(facesData);
    });
    return () => { cancelled = true; };
  }, []);

  const people = useMemo(() => wishes ? shuffle(wishes) : [], [wishes]);
  const n = people.length;
  const findIdxBySlug = (slug) => people.findIndex((p) => slugify(p.name) === slug);
  const [open, setOpen] = useState(null);

  // Once data has loaded, open whichever card the URL points to.
  useEffect(() => {
    if (!wishes) return;
    const slug = parseCardSlug();
    if (!slug) return;
    const idx = findIdxBySlug(slug);
    if (idx >= 0) setOpen(idx);
  }, [wishes]);

  // Sync state ← URL on browser back/forward.
  useEffect(() => {
    const onPop = () => {
      const slug = parseCardSlug();
      if (!slug) { setOpen(null); return; }
      const idx = findIdxBySlug(slug);
      setOpen(idx >= 0 ? idx : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [people]);

  // Opening a card pushes a new history entry. Closing pops it (so the browser
  // back button is the close gesture). Prev/next within the modal replaces
  // the entry so back doesn't visit every card you flipped past.
  const urlFor = (idx) => `#/wishes/${slugify(people[idx].name)}`;
  const openCard = (idx) => {
    setOpen(idx);
    window.history.pushState(null, "", urlFor(idx));
  };
  const navCard = (idx) => {
    setOpen(idx);
    window.history.replaceState(null, "", urlFor(idx));
  };
  const closeCard = () => {
    if (parseCardSlug() !== null) window.history.back();
    else setOpen(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (open === null) return;
      if (e.key === "Escape") closeCard();
      else if (e.key === "ArrowRight") navCard((open + 1) % n);
      else if (e.key === "ArrowLeft") navCard((open - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, n]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Phase-lock the face bobbles to the YouTube ambience. Every frame we ask
  // the player for currentTime and write 4 sets of (y, r, scale) CSS vars.
  // Each .m-face picks its variant via className so the mantel mixes
  // headbangers, swayers, poppers, and wigglers — all locked to the beat.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let rafId;
    const tick = () => {
      let phase = null, halfPhase = null, doublePhase = null;
      const p = getMusicPlayer();
      if (p) {
        try {
          // YT.PlayerState.PLAYING === 1. When paused/buffering, settle to rest.
          const state = typeof p.getPlayerState === "function" ? p.getPlayerState() : null;
          if (state === 1) {
            const t = p.getCurrentTime();
            if (typeof t === "number" && !Number.isNaN(t)) {
              phase = (((t / BEAT_SECONDS) % 1) + 1) % 1;
              halfPhase = (((t / (2 * BEAT_SECONDS)) % 1) + 1) % 1;
              doublePhase = (((t / (BEAT_SECONDS / 2)) % 1) + 1) % 1;
            }
          }
        } catch (e) {}
      }

      // [y0,r0,s0, y1,r1,s1, y2,r2,s2, y3,r3,s3] — scale defaults to 1 at rest.
      const out = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
      if (phase !== null) {
        const θ  = phase       * 2 * Math.PI;
        const θH = halfPhase   * 2 * Math.PI;
        const θD = doublePhase * 2 * Math.PI;

        // V0 HEADBANG — exaggerated vertical, barely any tilt
        out[0] = -10 * (1 + Math.cos(θ)) / 2;
        out[1] = 1.5 * Math.sin(θ);
        out[2] = 1;

        // V1 SWAY — slow half-time pendulum, big rotation
        out[3] = -2 * (1 + Math.cos(θH)) / 2;
        out[4] = 12 * Math.sin(θH);
        out[5] = 1;

        // V2 POP — scale pulse, snappy attack at phase 0 with exp decay
        out[6] = -2 * (1 + Math.cos(θ)) / 2;
        out[7] = 0;
        out[8] = 1 + 0.18 * Math.exp(-phase * 4);

        // V3 WIGGLE — eighth-note jitter, fast small y + r at 2x speed
        out[9]  = -3 * (1 + Math.cos(θD)) / 2;
        out[10] =  4 * Math.sin(θD);
        out[11] =  1;
      }
      for (let i = 0; i < 4; i++) {
        root.style.setProperty(`--bob-y-${i}`, `${out[i * 3].toFixed(2)}px`);
        root.style.setProperty(`--bob-r-${i}`, `${out[i * 3 + 1].toFixed(2)}deg`);
        root.style.setProperty(`--bob-s-${i}`, out[i * 3 + 2].toFixed(3));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      for (let i = 0; i < 4; i++) {
        root.style.removeProperty(`--bob-y-${i}`);
        root.style.removeProperty(`--bob-r-${i}`);
        root.style.removeProperty(`--bob-s-${i}`);
      }
    };
  }, []);

  return (
    <FacesContext.Provider value={faces}>
      <div className="wrap screen">
        <p className="vault-instruction">Nic, we love you ♥</p>

        <div className="mantel">
          {people.map((p, i) => <CardFront key={p.slot} p={p} idx={i} onOpen={openCard} />)}
        </div>

        <p className="vault-more">You deserve all the cakes in the world!</p>

        {open !== null && people[open] && (
          <OpenCard
            p={people[open]} idx={open} total={n}
            onClose={closeCard}
            onPrev={() => navCard((open - 1 + n) % n)}
            onNext={() => navCard((open + 1) % n)}
          />
        )}
      </div>
    </FacesContext.Provider>
  );
}
