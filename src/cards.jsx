/* ============================================================
   cards.jsx — TCard, enlarge/turn modal with magnifier lens
   ============================================================ */
import { useState, useRef } from "react";

/* --- The face: real PNG --- */
export function CardFace({ item }) {
  return <img src={item.img} alt={item.name} />;
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
const LENS_SIZE = 180;       // px — diameter of the floating magnifier lens
const LENS_ZOOM = 2.3;       // 230% backgroundSize for the PNG zoom
const LONG_PRESS_MS = 220;   // touch hold before the lens appears

export function CardModal({ item, caption, onClose }) {
  const [flipped, setFlipped] = useState(false);
  // lens: null = hidden; otherwise { x, y, fx, fy } where (x,y) is the cursor
  // in viewport coords, (fx,fy) is the focal point in image-space [0..1]
  const [lens, setLens] = useState(null);
  const cardRef = useRef(null);
  const longPressTimer = useRef(null);

  // Map a viewport point to image-space coords (un-rotating when flipped).
  // Returns null if the point is outside the card bounds.
  const focusFor = (clientX, clientY) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    if (flipped) { x = 1 - x; y = 1 - y; }
    return [x, y];
  };

  const showLensAt = (clientX, clientY) => {
    const f = focusFor(clientX, clientY);
    if (!f) { setLens(null); return; }
    setLens({ x: clientX, y: clientY, fx: f[0], fy: f[1] });
  };
  const hideLens = () => setLens(null);
  const clearLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          ref={cardRef}
          className={`modal__cardwrap${flipped ? " flipped" : ""}`}
          style={{ cursor: "zoom-in", touchAction: "none" }}
          onMouseMove={(e) => showLensAt(e.clientX, e.clientY)}
          onMouseLeave={hideLens}
          onTouchStart={(e) => {
            const t = e.touches[0]; if (!t) return;
            const x = t.clientX, y = t.clientY;
            clearLongPress();
            longPressTimer.current = setTimeout(() => {
              showLensAt(x, y);
              longPressTimer.current = null;
            }, LONG_PRESS_MS);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0]; if (!t) return;
            // Drag before long-press fires → treat as cancel (avoid surprise lens).
            if (longPressTimer.current) { clearLongPress(); return; }
            showLensAt(t.clientX, t.clientY);
          }}
          onTouchEnd={() => { clearLongPress(); hideLens(); }}
          onTouchCancel={() => { clearLongPress(); hideLens(); }}
        >
          <TCard item={item} glow />
        </div>
        <div className="modal__side">
          <div className="kicker kicker--dim">{item.reference ? "Vesna's original deck" : "Card Deck"} · {item.roman}</div>
          <h2>{item.name}</h2>
          {caption && (
            <div className="mono" style={{ marginTop: 4 }}>{caption.where} · {caption.date}</div>
          )}
          <p className="prose modal__hint">
            Hover the card to magnify — on a phone, press and hold. Some readers never look at one the right way up.
          </p>

          <div className="row mt">
            <button className="btn btn--ghost" onClick={() => setFlipped((f) => !f)}>
              {flipped ? "↻ Right way up" : "↻ Turn the card"}
            </button>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {lens && (
        <Lens
          x={lens.x} y={lens.y} fx={lens.fx} fy={lens.fy}
          flipped={flipped} item={item}
        />
      )}
    </div>
  );
}

/* Floating circular magnifier that follows the cursor / finger. */
function Lens({ x, y, fx, fy, flipped, item }) {
  // Offset the lens diagonally from the cursor; flip side near the right edge,
  // clamp top/bottom so the disc never leaves the viewport.
  const margin = 8, gap = 22;
  const vw = window.innerWidth, vh = window.innerHeight;
  const onRight = x + gap + LENS_SIZE + margin < vw;
  const left = onRight ? x + gap : x - gap - LENS_SIZE;
  let top = y - LENS_SIZE / 2;
  top = Math.max(margin, Math.min(vh - LENS_SIZE - margin, top));

  return (
    <div
      style={{
        position: "fixed", left, top,
        width: LENS_SIZE, height: LENS_SIZE,
        borderRadius: "50%",
        border: "1.5px solid var(--accent)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.6) inset, 0 0 22px rgba(216,64,31,0.25)",
        background: "#161310",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 100,
        transform: flipped ? "rotate(180deg)" : "none",
        backgroundImage: `url(${item.img})`,
        backgroundSize: `${LENS_ZOOM * 100}%`,
        backgroundPosition: `${fx * 100}% ${fy * 100}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
