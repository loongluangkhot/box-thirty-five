/* ============================================================
   components.jsx — shared Forensic-Modern UI primitives
   ============================================================ */
import { TCard } from "./cards.jsx";

export function Kicker({ children, dim }) {
  return <span className={`kicker${dim ? " kicker--dim" : ""}`}>{children}</span>;
}

export function Panel({ children, glow, className = "", style, onClick }) {
  return (
    <div className={`panel${glow ? " panel--glow" : ""} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

/* HTML reveal/answer text */
export function RichText({ html, className = "prose" }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------------- HUD ---------------- */
export function HUD({ day, cardCount, sound, onSound, onCards, onRestart }) {
  return (
    <div className="hud">
      <div className="hud__left">
        <span className="hud__tick"></span>
        <span className="hud__word">Box Thirty&#8209;Five</span>
        <span className="hud__chip">Case 077 · Pre&#8209;Crime</span>
      </div>
      <div className="hud__right">
        <span className="hud__night">Morning of <b>June&nbsp;{day}</b></span>
        <button className="hud__chip" style={{ cursor: "pointer", color: "var(--accent)", borderColor: "var(--accent-dim)" }} onClick={onCards}>
          The Cards · {cardCount}
        </button>
        <button className={`iconbtn${sound ? " iconbtn--on" : ""}`} title="Sound" onClick={onSound}>
          {sound ? "♪" : "○"}
        </button>
        <button className="iconbtn" title="Restart the case" onClick={onRestart}>⟲</button>
      </div>
    </div>
  );
}

/* ---------------- Location icons (line-art, stroke=currentColor) ---------------- */
const LOC_ICONS = {
  // Marlowe & Finch — neoclassical bank facade
  bank: (
    <g>
      <path d="M3 9 L12 4 L21 9 Z" />
      <line x1="5.5" y1="10" x2="5.5" y2="16.5" />
      <line x1="9.5" y1="10" x2="9.5" y2="16.5" />
      <line x1="14.5" y1="10" x2="14.5" y2="16.5" />
      <line x1="18.5" y1="10" x2="18.5" y2="16.5" />
      <line x1="3.5" y1="16.5" x2="20.5" y2="16.5" />
      <line x1="2.5" y1="19.5" x2="21.5" y2="19.5" />
    </g>
  ),
  // Madame Vesna — crystal ball on a stand
  vesna: (
    <g>
      <circle cx="12" cy="9.5" r="6" />
      <path d="M9 15.5 H15 L16.5 20 H7.5 Z" />
      <path d="M9.2 9 a3 3 0 0 1 2.8 -3" />
    </g>
  ),
  // Scotland Yard — case file folder
  yard: (
    <g>
      <path d="M3 7.5 a1 1 0 0 1 1 -1 H8.5 L10.5 8.5 H20 a1 1 0 0 1 1 1 V17.5 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 Z" />
      <line x1="7" y1="12.5" x2="17" y2="12.5" />
      <line x1="7" y1="15.5" x2="13.5" y2="15.5" />
    </g>
  ),
  // Felix's Workshop — a key
  workshop: (
    <g>
      <circle cx="8" cy="8" r="3.6" />
      <line x1="10.6" y1="10.6" x2="20" y2="20" />
      <line x1="17.5" y1="17.5" x2="19.6" y2="15.4" />
      <line x1="14.6" y1="14.6" x2="16.4" y2="12.8" />
    </g>
  ),
  // Royal Opera House — theatre mask
  opera: (
    <g>
      <path d="M5 5.5 C9 4.5 15 4.5 19 5.5 C19 14 15 19 12 19 C9 19 5 14 5 5.5 Z" />
      <path d="M8.2 9.5 q1.6 -1.6 3.2 0" />
      <path d="M12.6 9.5 q1.6 -1.6 3.2 0" />
      <path d="M9 13.5 q3 2.4 6 0" />
    </g>
  ),
  // The Crown & Anchor — an anchor
  pub: (
    <g>
      <circle cx="12" cy="4.5" r="1.8" />
      <line x1="12" y1="6.3" x2="12" y2="19.5" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <path d="M4.5 13 a7.5 7.5 0 0 0 15 0" />
      <line x1="4.5" y1="13" x2="4.5" y2="10.8" />
      <line x1="19.5" y1="13" x2="19.5" y2="10.8" />
    </g>
  ),
};
const LOCK_ICON = (
  <g>
    <rect x="5" y="10.5" width="14" height="9.5" rx="1.6" />
    <path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 V10.5" />
    <line x1="12" y1="14" x2="12" y2="16.5" />
  </g>
);

/* Reusable location glyph */
export function LocIcon({ id, size = 24, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {LOC_ICONS[id] || null}
    </svg>
  );
}

/* ---------------- Map node (location beacon) ---------------- */
export function MapNode({ loc, x, y, status, onClick }) {
  // status: "idle" | "done" | "locked"
  const locked = status === "locked";
  return (
    <div className="node" data-locked={locked} style={{ left: x + "%", top: y + "%" }} onClick={locked ? undefined : onClick}>
      <div className={`beacon beacon--${status}`}>
        <svg className="beacon__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {locked ? LOCK_ICON : (LOC_ICONS[loc.id] || null)}
        </svg>
        {status === "done" && <span className="beacon__badge">✓</span>}
      </div>
      {locked ? (
        <div className="node__locked">
          <div className="node__redact"></div>
          <div className="node__hint">Uncover more to unlock</div>
        </div>
      ) : (
        <div className="node__cap">
          {loc.name}
          <small>{loc.sub}</small>
        </div>
      )}
    </div>
  );
}

/* ---------------- Action hotspot row ---------------- */
export function ActionRow({ hs, done, locked, onClick }) {
  return (
    <button className={`action${done ? " action--done" : ""}${locked ? " dlg--locked" : ""}`} onClick={locked ? undefined : onClick} disabled={locked}>
      <span className="action__disc">{done ? "✓" : locked ? "◆" : "›"}</span>
      {locked ? (
        <span style={{ flex: 1 }} className="locked-hint">
          <span className="redact redact--row"></span>
          <span className="locked-hint__txt">Uncover more to unlock</span>
        </span>
      ) : (
        <span style={{ flex: 1 }}>
          <span className="action__verb">{done ? "Done" : hs.verb}</span>
          <div className="action__label">{hs.verb} {hs.label}</div>
          {done && hs.reveal && <div className="action__reveal"><RichText html={hs.reveal} /></div>}
          {done && hs.image && (
            <img className="action__image" src={hs.image} alt={hs.label} />
          )}
        </span>
      )}
    </button>
  );
}

/* ---------------- Dialogue option row ---------------- */
export function DialogueRow({ d, asked, locked, onClick }) {
  return (
    <button className={`dlg${asked ? " dlg--asked" : ""}${locked ? " dlg--locked" : ""}`} onClick={locked ? undefined : onClick} disabled={locked}>
      <span className="dlg__disc">{asked ? "✓" : locked ? "◆" : "›"}</span>
      {locked ? (
        <span style={{ flex: 1 }} className="locked-hint">
          <span className="redact redact--row"></span>
          <span className="locked-hint__txt">Uncover more to unlock</span>
        </span>
      ) : (
        <span style={{ flex: 1 }}>
          <span className="dlg__verb">{asked ? "Asked" : "Ask"}</span>
          <span className="dlg__q">{d.q}</span>
          {asked && <div className="dlg__a"><RichText html={d.a} /></div>}
        </span>
      )}
    </button>
  );
}

/* ---------------- Choice tile (deductions) ---------------- */
export function ChoiceTile({ num, sub, selected, onClick }) {
  return (
    <button className={`choice${selected ? " choice--sel" : ""}`} onClick={onClick}>
      <div className="choice__num">{num}</div>
      {sub && <div className="choice__sub">{sub}</div>}
    </button>
  );
}

/* ---------------- Toast host ---------------- */
export function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div className="toast" key={t.id} onClick={() => onDismiss(t.id)}>
          <span className="toast__tick"></span>
          <span>
            <div className="toast__date">{t.title}</div>
            <div className="toast__msg" dangerouslySetInnerHTML={{ __html: t.msg }} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Event banner (card arrival, on hub) ---------------- */
export function EventBanner({ ev, item, onLog }) {
  return (
    <div className="ebanner">
      <div className="ebanner__thumb"><TCard item={item} /></div>
      <div style={{ flex: 1 }}>
        <div className="ebanner__date">{ev.date} · arrived in the morning post</div>
        <div className="ebanner__name">{item.name} · {item.roman}</div>
        <div className="ebanner__line">{ev.line}</div>
      </div>
      <button className="btn ebanner__close" onClick={onLog}>Log it</button>
    </div>
  );
}
