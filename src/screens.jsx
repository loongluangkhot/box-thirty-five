/* ============================================================
   screens.jsx — every screen of Box Thirty-Five
   Each takes `ctx` (state + helpers) from App.
   ============================================================ */
import { useState } from "react";
import {
  DndContext, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, arrayMove, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CARD_ITEMS, CARD_EVENTS, CARD_CAPTIONS, LOCATIONS, OUTCOMES } from "./data.js";
import { TCard } from "./cards.jsx";
import {
  Kicker, Panel, RichText, MapNode, LocIcon,
  ActionRow, DialogueRow, EventBanner,
} from "./components.jsx";

export function capId(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------------- INTRO (single opener — with the card) ---------------- */
export function IntroScreen({ ctx }) {
  const wheel = CARD_ITEMS.wheel;
  const steps = [
    { n: "I", t: "Travel & examine", d: "Move freely across London. At each place, examine what you find and question who you meet. There is no casebook — a fact stays where you found it, so hold it in your head or travel back to read it again." },
    { n: "II", t: "Set the stakeout", d: "When you are sure, name the one night and the one hour he will strike, and wait in the dark to take him red-handed. Guess wrong and the case is not lost — you simply try again." },
  ];
  return (
    <div className="wrap screen">
      <div className="intro">
        <div style={{ width: "100%" }}>
          <div className="intro__grid">
            <div className="intro__card"><TCard item={wheel} glow onClick={() => ctx.openCard(wheel, CARD_CAPTIONS.wheel)} /></div>
            <div>
              <Kicker>Case 077 · Pre-Crime · A tarot deduction mystery</Kicker>
              <h1 style={{ margin: "14px 0 18px" }}>Box Thirty-Five</h1>
              <p className="prose">London, present day. The private bank of <strong>Marlowe &amp; Finch</strong> receives an envelope with no return address. Inside: a hand-painted tarot card — <strong>The Wheel of Fortune, Major Arcana X</strong> — and a note in looping script:</p>
              <div className="note">No fortune favors the unannounced. What is locked will open.</div>
              <p className="prose" style={{ marginTop: 20 }}>A thief, promising to crack the vault — and the bank, terrified for its clients, comes quietly to Scotland Yard. No date. No demand. Only the promise.</p>
            </div>
          </div>

          <div className="goal" style={{ marginTop: 30 }}>
            <Kicker>Your goal</Kicker>
            <p className="prose" style={{ margin: "8px 0 0", fontSize: 18 }}>
              The surest way to stop him is to catch him <strong>red-handed</strong>, waiting in the vault when he arrives — which means deducing the one <strong>night</strong> and the one <strong>hour</strong> he will come.
            </p>
          </div>

          <div className="section-head"><h2>How to play</h2><span className="rule"></span></div>
          <div className="howto">
            {steps.map((s) => (
              <Panel key={s.n} className="howto__step">
                <div className="howto__n">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </Panel>
            ))}
          </div>

          <div className="row mt-l">
            <button className="btn btn--solid" onClick={() => ctx.go("hub")}>Begin the case →</button>
            <span className="mono">Open the card. Look closely. He left nothing to chance — only to notice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- HUB (map + case tools) ---------------- */
export function HubScreen({ ctx }) {
  const { state } = ctx;
  const banner = state.pendingBanner ? CARD_EVENTS[state.pendingBanner] : null;
  return (
    <div className="wrap screen">
      <div className="section-head">
        <h2>The Case</h2><span className="rule"></span>
        <Kicker dim>Your own tools</Kicker>
      </div>
      <div className="case-grid">
        <Panel className="tool" onClick={() => ctx.go("cards")}>
          <div className="tool__thumb" style={{ width: 44 }}><TCard item={CARD_ITEMS.wheel} /></div>
          <div className="tool__body">
            <Kicker>{ctx.cards.length} in hand</Kicker>
            <h3>Card Deck</h3>
            <p>Lay them out and read the pictures.</p>
          </div>
        </Panel>
        <Panel className="tool" glow onClick={() => ctx.go("stakeout")}>
          <div className="tool__thumb" style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 12, height: 12, background: "var(--accent)", transform: "rotate(45deg)", display: "block" }}></span>
          </div>
          <div className="tool__body">
            <Kicker>Commit the watch</Kicker>
            <h3>Set the Stakeout</h3>
            <p>Name the night and the hour.</p>
          </div>
        </Panel>
      </div>

      <div className="section-head">
        <h2>London</h2><span className="rule"></span>
        <Kicker dim>Free travel · {ctx.unlockedCount} locations open</Kicker>
      </div>

      {banner && <EventBanner ev={banner} item={CARD_ITEMS[banner.card]} onLog={() => ctx.clearBanner()} />}

      <div className="map" style={{ marginTop: banner ? 16 : 0 }}>
        <div className="map__grid"></div>
        <div className="map__label"><Kicker dim>Investigation map</Kicker></div>
        {/* faint river */}
        <svg className="map__thames" viewBox="0 0 100 50" preserveAspectRatio="none">
          <path d="M-2 33 C18 28 28 40 46 38 C66 36 74 46 102 41" fill="none" stroke="rgba(120,150,190,0.10)" strokeWidth="3" />
        </svg>
        {LOCATIONS.map((loc) => (
          <MapNode key={loc.id} loc={loc} x={loc.x} y={loc.y}
            status={ctx.locStatus(loc)}
            onClick={() => ctx.travel(loc.id)} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- LOCATION ---------------- */
export function LocationScreen({ ctx }) {
  const loc = LOCATIONS.find((l) => l.id === ctx.state.screen);
  if (!loc) return null;
  const isVesna = loc.kind === "vesna";
  return (
    <div className="wrap screen">
      <div className="row" style={{ marginTop: 26, marginBottom: 18 }}>
        <button className="btn btn--ghost" onClick={() => ctx.go("hub")}>← London</button>
      </div>
      <Kicker>{loc.sub}</Kicker>
      <div className="loc-title">
        <span className="loc-title__icon"><LocIcon id={loc.id} size={40} /></span>
        <h1>{loc.name}</h1>
      </div>
      <p className="prose">{loc.blurb}</p>

      {isVesna && (
        <>
          <div className="section-head"><h2>Ask Madame Vesna</h2><span className="rule"></span></div>
          <div className="dlg-list">
            {loc.dialogue.map((d) => {
              const asked = ctx.has(`asked${capId(d.id)}`);
              const locked = !asked && !ctx.met(d.requires);
              return <DialogueRow key={d.id} d={d} asked={asked} locked={locked} onClick={() => ctx.ask(loc, d)} />;
            })}
          </div>
        </>
      )}

      <div className="section-head"><h2>{isVesna ? "In the shop" : "Examine"}</h2><span className="rule"></span></div>
      <div className="action-list">
        {loc.hotspots.map((hs) => {
          const done = ctx.hotspotDone(loc.id, hs.id);
          const locked = !done && hs.requires && !ctx.has(hs.requires);
          return <ActionRow key={hs.id} hs={hs} done={done} locked={locked} onClick={() => ctx.doHotspot(loc, hs)} />;
        })}
      </div>
    </div>
  );
}

/* ---------------- THE CARDS ---------------- */
function SortableCardCell({ id, item, cap, glow, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className="card-cell"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <TCard item={item} glow={glow} onClick={onOpen} />
      <div className="cap">
        <div className="name">{item.name} · {item.roman}</div>
        <div className="meta">{cap.where}{cap.date && cap.date !== "—" ? " · " + cap.date : ""}</div>
      </div>
    </div>
  );
}

export function CardsScreen({ ctx }) {
  const cards = ctx.cards;
  // Mouse: 8px movement to start drag (so single clicks open the modal).
  // Touch: long-press 200ms with 5px tolerance (so taps open the modal,
  // a hold initiates the drag — and HTML5 DnD's touch-blindness is bypassed).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = cards.indexOf(active.id);
    const newIdx = cards.indexOf(over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    ctx.reorderCards(arrayMove(cards, oldIdx, newIdx));
  };

  return (
    <div className="wrap screen">
      <div className="row" style={{ marginTop: 26, marginBottom: 6 }}>
        <button className="btn btn--ghost" onClick={() => ctx.go("hub")}>← London</button>
      </div>
      <Kicker>The detective's table</Kicker>
      <h1 style={{ margin: "10px 0 8px" }}>Card Deck</h1>
      <p className="prose" style={{ marginBottom: 26 }}>Everything you carry, laid out as you please. Drag a card to rearrange it on the table — on a phone, press and hold first.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={cards} strategy={rectSortingStrategy}>
          <div className="cards-row">
            {cards.map((id) => {
              const item = CARD_ITEMS[id];
              const cap = CARD_CAPTIONS[id] || { date: "—", where: "" };
              return (
                <SortableCardCell
                  key={id}
                  id={id}
                  item={item}
                  cap={cap}
                  glow={id === "wheel"}
                  onOpen={() => ctx.openCard(item, cap)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ---------------- STAKEOUT — interactive pickers ---------------- */

// June month grid (June 1 falls on a Monday)
function JuneCalendar({ value, onPick }) {
  const offset = 1;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= 30; d++) cells.push(d);
  const wk = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return (
    <div className="cal">
      <div className="cal__head">{wk.map((w) => <span key={w}>{w}</span>)}</div>
      <div className="cal__grid">
        {cells.map((d, i) => d === null
          ? <span key={i} className="cal__blank"></span>
          : <button key={i} className={`cal__day${value === d ? " cal__day--sel" : ""}`} onClick={() => onPick(d)}>{d}</button>
        )}
      </div>
    </div>
  );
}

// Time formatter — total minutes -> "h:mm AM/PM" (matches HOURS format)
function fmtTime(totalMin) {
  const h24 = Math.floor(totalMin / 60), mm = totalMin % 60;
  const ap = h24 < 12 ? "AM" : "PM";
  let h12 = h24 % 12; if (h12 === 0) h12 = 12;
  return `${h12}:${mm === 0 ? "00" : "30"} ${ap}`;
}

// Set-the-watch stepper — alarm-clock style hour/minute steppers + AM/PM
function StepperPicker({ value, onChange }) {
  const cur = value === null ? 0 : value; // default visual: 4:30 PM
  const dim = value === null;
  const step = (d) => onChange((((cur + d) % 1440) + 1440) % 1440);
  const h24 = Math.floor(cur / 60), mm = cur % 60;
  const ap = h24 < 12 ? "AM" : "PM";
  let h12 = h24 % 12; if (h12 === 0) h12 = 12;
  return (
    <div className="stepper">
      <div className="stepper__col">
        <button className="stepper__btn" onClick={() => step(60)} aria-label="Hour up">▲</button>
        <div className={`stepper__field${dim ? " is-dim" : ""}`}>{h12}</div>
        <button className="stepper__btn" onClick={() => step(-60)} aria-label="Hour down">▼</button>
        <span className="stepper__lab">Hour</span>
      </div>
      <span className="stepper__colon">:</span>
      <div className="stepper__col">
        <button className="stepper__btn" onClick={() => step(30)} aria-label="Minute up">▲</button>
        <div className={`stepper__field${dim ? " is-dim" : ""}`}>{mm === 0 ? "00" : "30"}</div>
        <button className="stepper__btn" onClick={() => step(-30)} aria-label="Minute down">▼</button>
        <span className="stepper__lab">Min</span>
      </div>
      <div className="stepper__col stepper__col--ap">
        <button className={`ap${ap === "AM" && !dim ? " ap--on" : ""}`} onClick={() => onChange((h24 % 12) * 60 + mm)}>AM</button>
        <button className={`ap${ap === "PM" && !dim ? " ap--on" : ""}`} onClick={() => onChange(((h24 % 12) + 12) * 60 + mm)}>PM</button>
      </div>
    </div>
  );
}

export function StakeoutScreen({ ctx }) {
  const [dateNum, setDateNum] = useState(null);
  const [tmin, setTmin] = useState(null); // total minutes 0..1439
  const ready = dateNum !== null && tmin !== null;
  const hourStr = tmin !== null ? fmtTime(tmin) : "";
  return (
    <div className="wrap screen">
      <div className="row" style={{ marginTop: 26, marginBottom: 18 }}>
        <button className="btn btn--ghost" onClick={() => ctx.go("hub")}>← London</button>
      </div>
      <Kicker>The Case · commit the watch</Kicker>
      <h1 style={{ margin: "10px 0 16px" }}>Set the Stakeout</h1>
      <p className="prose">Name one night and one hour. The constables will wait with you in the vault corridor — once. Choose by what the cards have told you, not by what they seemed to say.</p>

      {ctx.state.hasFailed && (
        <div className="q-nudge" style={{ marginTop: 24 }}>
          <Kicker>Last watch came up empty</Kicker>
          <p>{ctx.state.lastNudge}</p>
        </div>
      )}

      <div className="case-grid" style={{ marginTop: 30 }}>
        <Panel style={{ padding: 26 }}>
          <Kicker>Deduction I · The night</Kicker>
          <h3 style={{ margin: "10px 0 18px" }}>Which night does he come?</h3>
          <JuneCalendar value={dateNum} onPick={setDateNum} />
          <div className="pick-readout">{dateNum ? <span><b>June {dateNum}</b></span> : <span className="dim">No night chosen</span>}</div>
        </Panel>
        <Panel style={{ padding: 26 }}>
          <Kicker>Deduction II · The hour</Kicker>
          <h3 style={{ margin: "10px 0 18px" }}>At what hour exactly?</h3>
          <StepperPicker value={tmin} onChange={setTmin} />
          <div className="pick-readout">{tmin !== null ? <span><b>{hourStr}</b></span> : <span className="dim">No hour chosen</span>}</div>
        </Panel>
      </div>

      <div className="row mt-l">
        <button className="btn btn--solid" disabled={!ready} onClick={() => ctx.commitStakeout(dateNum, hourStr)}>
          Set the watch & wait →
        </button>
        {ready && <span className="mono">June {dateNum} · {hourStr}</span>}
      </div>
    </div>
  );
}

/* ---------------- OUTCOME (failures) ---------------- */
export function OutcomeScreen({ ctx }) {
  const o = ctx.state.outcome;
  const conf = OUTCOMES[o.key];
  return (
    <div className="wrap screen">
      <div className="scene">
        <div className="scene__inner">
          <span className="stamp"><span className="d"></span><Kicker>{conf.kicker}</Kicker></span>
          <div className="result-title">
            <span className="result-title__icon result-title__icon--wrong">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8" />
                <line x1="6.34" y1="6.34" x2="17.66" y2="17.66" />
              </svg>
            </span>
            <h1>{conf.title}</h1>
          </div>
          <RichText html={conf.body} />
          <div className="q-nudge">
            <Kicker>The case is not lost</Kicker>
            <p>{conf.q}</p>
          </div>
          <div className="row mt-l">
            <button className="btn btn--solid" onClick={() => ctx.go("stakeout")}>Set the watch again →</button>
            <button className="btn btn--ghost" onClick={() => ctx.go("hub")}>Return to London</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- VAULT (success) ---------------- */
export function VaultScene({ ctx }) {
  return (
    <div className="wrap screen">
      <div className="scene">
        <div className="scene__inner">
          <span className="stamp"><span className="d"></span><Kicker>June 14 · 4:10 AM · Stakeout live</Kicker></span>
          <div className="result-title">
            <span className="result-title__icon result-title__icon--right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="15" r="4.3" />
                <circle cx="17" cy="15" r="4.3" />
                <path d="M7 10.7 V8.6 a2.1 2.1 0 0 1 2.1 -2.1 h5.8 a2.1 2.1 0 0 1 2.1 2.1 v2.1" />
                <line x1="11.3" y1="15" x2="12.7" y2="15" />
              </svg>
            </span>
            <h1>Red-handed</h1>
          </div>
          <div className="prose">
            <p>You wait in the dark of the vault corridor with two constables, since ten past four. The bank sleeps. The city sleeps.</p>
            <p>At <strong>4:30</strong> exactly — the painted clock, stood on its head, made flesh — the grate swings open. Felix Marsh drops down into the pre-dawn dark, drill in hand, <em>The Fool</em> tucked in his coat pocket — his own card, numbered zero.</p>
            <p>He never reaches Box 35. The handcuffs close before the drill touches metal. He read the hour upside down, as he read everything, and you were there to meet it.</p>
          </div>
          <div className="row mt-l">
            <button className="btn btn--solid" onClick={() => ctx.go("finale")}>And yet — what did he think was inside? →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- FINALE ---------------- */
export function FinaleScene({ ctx }) {
  return (
    <div className="wrap screen">
      <div className="scene">
        <div className="scene__inner">
          <span className="stamp"><span className="d"></span><Kicker>The vault · later that morning</Kicker></span>
          <h1 style={{ marginBottom: 22 }}>Box Thirty-Five</h1>
          <div className="prose">
            <p>Felix is taken away laughing, then weeping, then quiet. The vault is untouched — and still the question gnaws. You ask the one man who knows. <strong>Nicholas Neo</strong> answers without hesitation: <span className="speak">"Gold, he must have thought. Bonds."</span> Then, simply: <span className="speak">"Open it."</span></p>
            <p>Box 35 holds no gold and no bonds. Bundles of envelopes tied in ribbon — <strong>fifty years of birthday cards</strong>. From school friends. From his late wife. From a doorman he once helped through a hard winter. On top, a note in Neo's hand:</p>
            <div className="note">To whoever opens this expecting riches: this is everything I own that cannot be replaced.</div>
            <p style={{ marginTop: 22 }}>Neo presses the lightest charges, on one condition: Felix builds the bank's new vault on release — and accepts, this time, what he refused six years ago. Every year after, one more envelope joins Box 35. And one arrives at Felix's flat, signed simply, <em>N.N.</em></p>
          </div>
          <div className="row mt-l">
            <span className="stamp"><span className="d"></span><Kicker>Case 077 · Closed</Kicker></span>
          </div>
          <div className="row mt">
            <button className="btn btn--ghost" onClick={() => ctx.restart()}>⟲ Play the case again</button>
          </div>
        </div>
      </div>
    </div>
  );
}
