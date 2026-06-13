/* ============================================================
   cards.jsx — TCard, drawn placeholder art, enlarge/turn modal
   ============================================================ */
import { useState } from "react";

/* Gilt line color for placeholder art */
const GILT = "#c9a24b";

/* --- The clock tower (the puzzle): reads 10:00 upright -> 4:30 reversed --- */
export function ClockTower() {
  // viewBox local; reused at card scale and magnified
  const cx = 50, cy = 30, r = 17;
  // minute hand -> straight up (12)
  const mx = cx, my = cy - r * 0.86;
  // hour hand -> 10 o'clock (300deg clockwise from top): upper-left
  const ang = (300 * Math.PI) / 180;
  const hx = cx + r * 0.55 * Math.sin(ang);
  const hy = cy - r * 0.55 * Math.cos(ang);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* tower body */}
      <rect x="36" y="40" width="28" height="46" fill="none" stroke={GILT} strokeWidth="1.4" />
      <path d="M34 40 L50 24 L66 40 Z" fill="none" stroke={GILT} strokeWidth="1.4" />
      <line x1="50" y1="24" x2="50" y2="17" stroke={GILT} strokeWidth="1.2" />
      <circle cx="50" cy="15" r="1.8" fill={GILT} />
      <rect x="45" y="64" width="10" height="22" fill="none" stroke={GILT} strokeWidth="1" />
      {/* clock face */}
      <circle cx={cx} cy={cy} r={r} fill="#161310" stroke={GILT} strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={r - 3} fill="none" stroke={GILT} strokeWidth="0.5" opacity="0.6" />
      {[...Array(12)].map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = cx + (r - 1.5) * Math.sin(a), y1 = cy - (r - 1.5) * Math.cos(a);
        const x2 = cx + (r - 3) * Math.sin(a), y2 = cy - (r - 3) * Math.cos(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GILT} strokeWidth="0.7" />;
      })}
      {/* hands: 10:00 */}
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke={GILT} strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={GILT} strokeWidth="2.1" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="1.7" fill={GILT} />
    </svg>
  );
}

/* --- Per-card placeholder artwork (schematic; carries puzzle detail) --- */
export function CardArt({ kind }) {
  const stroke = GILT;
  const base = { fill: "none", stroke, strokeWidth: 1.4, vectorEffect: "non-scaling-stroke" };
  switch (kind) {
    case "wheel":
    case "wheel_original": {
      const altered = kind === "wheel";
      return (
        <svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* the wheel */}
          <circle cx="50" cy="52" r="30" {...base} />
          <circle cx="50" cy="52" r="20" {...base} strokeWidth="1" />
          <circle cx="50" cy="52" r="5" fill={stroke} />
          {[0, 45, 90, 135].map((d) => {
            const a = (d * Math.PI) / 180;
            return <line key={d} x1={50 - 30 * Math.cos(a)} y1={52 - 30 * Math.sin(a)} x2={50 + 30 * Math.cos(a)} y2={52 + 30 * Math.sin(a)} stroke={stroke} strokeWidth="0.8" />;
          })}
          {/* horizon line */}
          <line x1="10" y1="120" x2="90" y2="120" stroke={stroke} strokeWidth="0.8" opacity="0.7" />
          {/* horizon detail: church tower w/ clock — ONLY on the altered (forged) card */}
          {altered && (
            <g transform="translate(40,104) scale(0.42)">
              <ClockTower />
            </g>
          )}
        </svg>
      );
    }
    case "hermit":
    case "hermit_original": {
      const moon = kind === "hermit";
      return (
        <svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* hooded figure (abstract) */}
          <path d="M50 30 C36 30 32 50 34 84 L66 84 C68 50 64 30 50 30 Z" {...base} />
          <path d="M50 30 C44 30 42 40 42 52 L58 52 C58 40 56 30 50 30 Z" {...base} strokeWidth="1" />
          {/* staff */}
          <line x1="74" y1="20" x2="74" y2="96" stroke={stroke} strokeWidth="1.4" />
          {/* raised lantern */}
          <rect x="20" y="34" width="22" height="26" rx="2" {...base} />
          <line x1="31" y1="28" x2="31" y2="34" stroke={stroke} strokeWidth="1.2" />
          <path d="M24 28 Q31 22 38 28" {...base} strokeWidth="1" />
          {moon ? (
            // full moon inside the lantern
            <circle cx="31" cy="47" r="7" fill="#161310" stroke={stroke} strokeWidth="1.4" />
          ) : (
            // traditional six-point star
            <g stroke={stroke} strokeWidth="1.4">
              <line x1="31" y1="40" x2="31" y2="54" />
              <line x1="25" y1="43.5" x2="37" y2="50.5" />
              <line x1="25" y1="50.5" x2="37" y2="43.5" />
            </g>
          )}
        </svg>
      );
    }
    case "strength":
      return (
        <svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* lemniscate */}
          <path d="M30 60 C30 48 48 48 50 60 C52 72 70 72 70 60 C70 48 52 48 50 60 C48 72 30 72 30 60 Z" {...base} />
          {/* arch / laurel suggestion */}
          <path d="M28 96 Q50 80 72 96" {...base} strokeWidth="1" />
          <circle cx="50" cy="34" r="3" fill={stroke} opacity="0.8" />
        </svg>
      );
    case "fool":
      return (
        <svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* sun */}
          <circle cx="74" cy="30" r="8" {...base} strokeWidth="1" />
          {/* cliff edge */}
          <path d="M14 110 L54 110 L54 130 L86 130" {...base} strokeWidth="1" opacity="0.8" />
          {/* wanderer's bundle on a stick */}
          <line x1="40" y1="62" x2="52" y2="44" stroke={stroke} strokeWidth="1.4" />
          <path d="M50 40 q8 -3 8 6 q-8 3 -8 -6 Z" {...base} strokeWidth="1" />
          {/* small step-off figure (abstract) */}
          <circle cx="40" cy="70" r="5" {...base} strokeWidth="1.2" />
          <line x1="40" y1="75" x2="40" y2="98" stroke={stroke} strokeWidth="1.4" />
          <line x1="40" y1="82" x2="31" y2="90" stroke={stroke} strokeWidth="1.2" />
          <line x1="40" y1="98" x2="34" y2="110" stroke={stroke} strokeWidth="1.2" />
          <line x1="40" y1="98" x2="48" y2="108" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "seven":
      return (
        <svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* five swords carried (left), two left standing (right) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${24 + i * 6},${40 + i * 2}) rotate(${-12})`}>
              <line x1="0" y1="0" x2="0" y2="54" stroke={stroke} strokeWidth="1.3" />
              <path d="M-3 0 L0 -6 L3 0 Z" fill={stroke} />
            </g>
          ))}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${74 + i * 7},44)`}>
              <line x1="0" y1="0" x2="0" y2="58" stroke={stroke} strokeWidth="1.3" opacity="0.85" />
              <path d="M-3 0 L0 -6 L3 0 Z" fill={stroke} opacity="0.85" />
            </g>
          ))}
        </svg>
      );
    default:
      return null;
  }
}

/* --- The face: real PNG if provided, else the placeholder mount --- */
export function CardFace({ item }) {
  if (item.img) {
    return <img src={item.img} alt={item.name} />;
  }
  return (
    <div className="pcard">
      <div className="pcard__frame"></div>
      <div className="pcard__num">{item.roman}</div>
      <div className="pcard__art"><CardArt kind={item.kind} /></div>
      <div className="pcard__name">{item.name}</div>
      <div className="pcard__tag">{item.reference ? "Vesna's deck · ref" : "art placeholder"}</div>
    </div>
  );
}

/* --- TCard: themed mount with alpha-hugging shadow --- */
export function TCard({ item, glow, onClick, flipped }) {
  return (
    <div
      className={`card${glow ? " card--glow" : ""}${onClick ? " card--btn" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={flipped ? { transform: "rotate(180deg)" } : undefined}
    >
      <CardFace item={item} />
    </div>
  );
}

/* --- Enlarge + turn modal --- */
const FOCUS = {
  wheel: [0.6, 0.7], wheel_original: [0.6, 0.7],
  hermit: [0.33, 0.36], hermit_original: [0.33, 0.36],
  fool: [0.5, 0.5], strength: [0.5, 0.45], seven: [0.5, 0.45],
};

export function CardModal({ item, caption, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const [fx, fy] = FOCUS[item.kind] || [0.5, 0.45];
  const S = 2.3, Wc = 240, Hc = 240 * 1.751;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className={`modal__cardwrap${flipped ? " flipped" : ""}`}>
          <TCard item={item} glow />
        </div>
        <div className="modal__side">
          <div className="kicker kicker--dim">{item.reference ? "Vesna's original deck" : "The Cards"} · {item.roman}</div>
          <h2>{item.name}</h2>
          {caption && (
            <div className="mono" style={{ marginTop: 4 }}>{caption.where} · {caption.date}</div>
          )}
          <p className="prose" style={{ fontSize: 16, marginTop: 16 }}>
            Examine it as long as you like. Some readers never look at a card the right way up.
          </p>

          {/* magnifier — neutral detail window (sharp for vector, 440% for real art) */}
          <div className="kicker kicker--dim" style={{ marginTop: 18 }}>Magnifier</div>
          <div
            className="zoom"
            style={
              item.img
                ? { backgroundImage: `url(${item.img})`, backgroundSize: "440%", backgroundPosition: "66% 71%", transform: flipped ? "rotate(180deg)" : "none" }
                : { overflow: "hidden", transform: flipped ? "rotate(180deg)" : "none" }
            }
          >
            {!item.img && (
              <div style={{ position: "absolute", top: 0, left: 0, width: Wc, height: Hc, transformOrigin: "0 0", transform: `translate(${120 - fx * Wc * S}px, ${120 - fy * Hc * S}px) scale(${S})` }}>
                <CardFace item={item} />
              </div>
            )}
            <div className="zoom__lab mono" style={{ background: "rgba(0,0,0,0.5)", padding: "3px 7px" }}>detail</div>
          </div>

          <div className="row mt">
            <button className="btn btn--ghost" onClick={() => setFlipped((f) => !f)}>
              {flipped ? "↻ Right way up" : "↻ Turn the card"}
            </button>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
