/* ============================================================
   wishes.jsx — Box Thirty-Five · the mantel of birthday cards.
   One card per person. Open it to read what they sent.
   ============================================================ */
import { useState, useEffect, useMemo } from "react";
import { WISHES } from "./wishes-data.js";

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
  "Vintage, and still corking",
  "Officially a classic",
  "Older, but no wiser",
  "Level thirty‑five unlocked",
  "Wrinkles? Laugh lines.",
  "Fully ripened",
  "Still got it. Mostly.",
  "A fine year for it",
];

/* one of ten simple cover motifs, chosen by slot */
function Motif({ v }) {
  switch (v) {
    case 0:
      return (
        <span className="m-garland">
          {Array.from({ length: 5 }).map((_, i) => <i key={i} className="motif-d motif-d--sm"></i>)}
        </span>
      );
    case 1:
      return <span className="m-emblem"><i className="motif-d"></i></span>;
    case 2:
      return <span className="m-numeral">35</span>;
    case 3:
      return <span className="m-rings"><span></span><span></span><span></span></span>;
    case 4:
      return <span className="m-confetti">{Array.from({ length: 6 }).map((_, i) => <i key={i}></i>)}</span>;
    case 5:
      return (
        <span className="m-candles">
          {[30, 40, 30].map((h, i) => (
            <span className="cd" key={i}>
              <i className="flame"></i>
              <i className="stick" style={{ height: h }}></i>
            </span>
          ))}
        </span>
      );
    case 6:
      return (
        <span className="m-balloons">
          <i className="bl bl--a"></i>
          <i className="bl bl--b"></i>
          <i className="str str--a"></i>
          <i className="str str--b"></i>
        </span>
      );
    case 7:
      return (
        <span className="m-spark">
          {Array.from({ length: 6 }).map((_, i) => (
            <i key={i} style={{ transform: "translate(-50%,-50%) rotate(" + (i * 30) + "deg)" }}></i>
          ))}
          <i className="m-spark__dot"></i>
        </span>
      );
    case 8:
      return (
        <span className="m-gift">
          <i className="box"></i>
          <i className="rib"></i>
          <i className="bow"></i>
        </span>
      );
    default:
      return (
        <span className="m-quatre">
          <i></i><i></i><i></i><i></i>
          <i className="m-quatre__dot"></i>
        </span>
      );
  }
}

function CardFront({ p, idx, onOpen }) {
  return (
    <button className="bcard" onClick={() => onOpen(idx)}>
      <div className={"bcard__cover paper-" + (p.slot % 3)}>
        <span className="bcard__motif"><Motif v={p.slot % 10} /></span>
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
      <figure className={"cv-item cv-photo" + (item.src ? " cv-photo--src" : "")}>
        <div className={"frame" + (item.src ? "" : " ph ph--photo")}>
          {item.src
            ? <img src={item.src} alt={item.label || ""} />
            : <span className="ph__tag">Photo · drop file</span>}
        </div>
        {item.label && <figcaption className="cv-cap">{item.label}</figcaption>}
      </figure>
    );
  }
  if (item.type === "audio") {
    return (
      <figure className="cv-item cv-voice">
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
      </figure>
    );
  }
  if (item.type === "video") {
    return (
      <figure className={"cv-item cv-video" + (item.src ? " cv-video--src" : "")}>
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
      </figure>
    );
  }
  return null;
}

function OpenCard({ p, idx, total, onClose, onPrev, onNext }) {
  return (
    <div className="card-scrim" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-modal__bar">
          <div className="card-modal__title">
            <span className="namecake" aria-hidden="true">
              <i className="namecake__flame"></i>
              <i className="namecake__candle"></i>
              <i className="namecake__base"></i>
            </span>
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
            <div className="canvas__eyebrow">Happy Birthday, Nicholas</div>
          </div>

          <div className="canvas__body">
            {p.items.map(it => <CanvasItem key={it.name} item={it} />)}
          </div>

          <div className="canvas__foot">With love, {p.name}</div>
        </div>
      </div>
    </div>
  );
}

export function WishesScene({ ctx }) {
  const [open, setOpen] = useState(null);
  const people = useMemo(() => shuffle(WISHES), []);
  const n = people.length;

  useEffect(() => {
    const onKey = (e) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") setOpen((o) => (o + 1) % n);
      else if (e.key === "ArrowLeft") setOpen((o) => (o - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, n]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="wrap screen">
      <p className="vault-instruction">Open a card to read what they sent</p>

      <div className="mantel">
        {people.map((p, i) => <CardFront key={p.slot} p={p} idx={i} onOpen={setOpen} />)}
      </div>

      <p className="vault-more">More coming!</p>

      {open !== null && (
        <OpenCard
          p={people[open]} idx={open} total={n}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((o) => (o - 1 + n) % n)}
          onNext={() => setOpen((o) => (o + 1) % n)}
        />
      )}
    </div>
  );
}
