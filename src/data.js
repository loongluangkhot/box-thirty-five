/* ============================================================
   BOX THIRTY FIVE — game data & narrative content
   Reveal/answer copy is HTML (rendered via dangerouslySetInnerHTML)
   so we can use <em>/<strong> inline. Voice: spare, noir,
   observational — never spell out the conclusion.
   ============================================================ */

/* ---------- THE CARDS (registry; img:'' -> drawn placeholder) ---------- */
// Drop real PNGs in by setting img to a path; the placeholder art vanishes.
export const CARD_ITEMS = {
  wheel: {
    id: "wheel", name: "The Wheel of Fortune", roman: "X", kind: "wheel",
    img: "/wheel_of_fortune_altered.png", glow: true,
  },
  wheel_original: {
    id: "wheel_original", name: "The Wheel of Fortune", roman: "X", kind: "wheel_original",
    img: "/wheel_of_fortune_original.png", reference: true,
  },
  hermit: {
    id: "hermit", name: "The Hermit", roman: "IX", kind: "hermit",
    img: "/hermit_altered.png",
  },
  hermit_original: {
    id: "hermit_original", name: "The Hermit", roman: "IX", kind: "hermit_original",
    img: "/hermit_original.png", reference: true,
  },
  strength: {
    id: "strength", name: "Strength", roman: "VIII", kind: "strength",
    img: "/strength.png",
  },
  fool: {
    id: "fool", name: "The Fool", roman: "0", kind: "fool", img: "",
  },
  seven: {
    id: "seven", name: "Seven of Swords", roman: "VII", kind: "seven",
    img: "/seven_of_swords.png",
  },
};

/* ---------- HOUR SLOTS (48 half-hours) ---------- */
function buildHours() {
  const out = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const ap = h < 12 ? "AM" : "PM";
      let hh = h % 12; if (hh === 0) hh = 12;
      out.push(`${hh}:${m === 0 ? "00" : "30"} ${ap}`);
    }
  }
  return out;
}
export const HOURS = buildHours();

export const ANSWER = { night: 14, hour: "4:30 AM", trapHour: "10:00 PM" };

/* ---------- LOCATIONS ---------- */
// hotspot: { id, verb, label, requires?, reveal(HTML), addCard?, effects:{set:[],unlock:[],arrive?} }
export const LOCATIONS = [
  {
    id: "bank", name: "Marlowe & Finch", sub: "Private Bank · the City",
    x: 43, y: 20,
    blurb: "Hush and brass and the smell of money kept too long. The manager hovers; the clients have not been told. Somewhere above the vault, a thief left his calling card.",
    hotspots: [
      {
        id: "envelope", verb: "Open", label: "the first envelope",
        reveal: `On the desk, an envelope with no return address. Inside, a single hand-painted card — <strong>The Wheel of Fortune</strong>, the numeral <strong>X</strong> in the corner — and a note in looping script.
        <div class="note">No fortune favors the unannounced. What is locked will open.</div>
        <p style="margin-top:14px">No date. No demand. Only the promise. The card is yours now; it joins <em>The Cards</em>.</p>`,
      },
      {
        id: "vent", verb: "Unscrew", label: "the brass air vent",
        reveal: `The screws turn too easily — their slots are bright where a fresh tool bit into the brass. Someone has had this grate off recently, and put it back with care. The shaft beyond runs down toward the vault corridor, just wide enough for a thin man.`,
      },
      {
        id: "ledger", verb: "Pull", label: "the maintenance ledger",
        reveal: `Years of signatures for work on the locks and the vault door. One name recurs through the early entries, the contractor who overhauled the mechanism six years ago: <strong>FELIX MARSH, locksmith</strong>. The later pages are someone else's hand. He has not signed since.`,
        effects: { set: ["felixNamed"], unlock: ["workshop"], unlockToast: { title: "New location", msg: "<b>Felix's Workshop</b> is open to you." } },
      },
      {
        id: "visitors", verb: "Open", label: "the visitors' book",
        reveal: `Most entries are dull — couriers, clerks, the auditor. One oddity: the tenor <strong>Enrico Belloni</strong> signed in three times in a single week this spring, each visit only minutes long. A famous voice has no business in a bank vault three times in seven days.`,
        effects: { set: ["operaUnlocked"], unlock: ["opera"], unlockToast: { title: "New location", msg: "<b>The Royal Opera House</b> is open to you." } },
      },
    ],
  },
  {
    id: "vesna", name: "Madame Vesna's Shop", sub: "Tarot Reader · Cecil Court", kind: "vesna",
    x: 16, y: 74,
    blurb: "A bell, a beaded curtain, and the smell of tallow. Vesna does not look up when you enter. “You’ve brought me something that isn’t mine,” she says, “and something that is.”",
    dialogue: [
      {
        id: "showCard", q: "Show her a painted card", req: "Needs a card",
        requires: "openedEnvelope",
        a: `She turns the Wheel over in her hands and her mouth tightens. <span class="speak">“These are mine. My deck, my hand — except they are not my hand at all. Someone has copied them, stroke for stroke.”</span> She sets it down. <span class="speak">“Hold a copy against the original and a trained eye finds where the copyist strayed. Borrow my deck. Look for yourself — I will not do your seeing for you.”</span>`,
      },
      {
        id: "borrowDeck", q: "Borrow her original deck", req: "Ask to compare first",
        requires: "askedShowCard",
        a: `She wraps the deck in black silk and presses it into your hands. <span class="speak">“Mine are honest. Lay them beside the forgeries on your own table. Where they differ, the copyist meant something.”</span> Vesna's true cards now sit on the table beside yours.`,
        effects: { set: ["borrowedDeck"], addCards: ["wheel_original", "hermit_original"] },
      },
      {
        id: "askFelix", q: "Ask about Felix Marsh", req: "Needs his name",
        requires: "felixNamed",
        a: `<span class="speak">“Felix. Yes — years a client, and a reader himself, better than most.”</span> She almost smiles. <span class="speak">“But he never sat under his own name. In the circle he read as a card. <strong>The Fool</strong> — the wanderer who carries nothing, fears nothing. He liked that it is numbered <strong>zero</strong>. ‘The only honest number,’ he’d say, ‘the one you count toward when everything else is spent.’”</span>`,
      },
      {
        id: "askReading", q: "Ask about his peculiar reading", req: "Ask about Felix first",
        requires: "askedAskFelix",
        a: `<span class="speak">“Ah. That.”</span> She cuts an imaginary deck and turns the halves over. <span class="speak">“Felix cut the deck upside down. Every card he read <strong>reversed</strong> — always. ‘Fortune only tells me the truth standing on its head,’ he used to say. It drove the others mad. He never once read a card the right way up.”</span>`,
      },
      {
        id: "askOrder", q: "Ask about the order of the cards", req: "Wait for more to arrive",
        requires: "strengthArrived",
        a: `She lays the three painted cards in the order they came. <span class="speak">“Ten. Then nine. Then eight.”</span> Her finger taps each numeral. <span class="speak">“These were not dealt, detective. They were <strong>counted</strong>. One each morning, each a step lower than the last. A deck does not do that on its own. A man does — a man marking off the days to something.”</span>`,
      },
      {
        id: "askHermit", q: "Ask about the altered lantern", req: "Needs the Hermit & her deck",
        requires: ["hermitArrived", "borrowedDeck"],
        a: `She holds the forged Hermit beside her own. <span class="speak">“My hermit carries a star in his lamp — the light of one distant truth. The copyist gave his lamp a <strong>full moon</strong> instead.”</span> She taps the painted disc. <span class="speak">“A man does not change a thing like that by accident. He wanted the moon in the picture. Why, I leave to you.”</span>`,
      },
    ],
    hotspots: [
      {
        id: "almanac", verb: "Study", label: "the lunar almanac on the shelf",
        isImage: "almanac",
        image: "/lunar_almanac.png",
        reveal: `An unmarked almanac, open to <strong>June</strong>. The month's phases are printed plainly: last quarter on the <strong>6th</strong>, <strong>full moon on the 14th</strong>, lunar perigee on the 17th. Nothing is circled. Nothing is noted. It simply tells the truth about the sky.`,
        effects: { set: ["almanacSeen"] },
      },
      {
        id: "crystal", verb: "Glance at", label: "the crystal ball",
        reveal: `You lean toward the glass. Vesna does not. <span class="speak">“Decoration, detective. The cards do the work.”</span> Your own face, upside down and small. Nothing else.`,
      },
    ],
  },
  {
    id: "yard", name: "Scotland Yard", sub: "Records & Case Files · Embankment",
    x: 48, y: 54,
    onEnter: "yardVisited",
    blurb: "Green-shaded lamps and the rustle of paper. Down here the dead cases sleep in boxes. Yours is wide awake, and getting louder by the morning.",
    hotspots: [
      {
        id: "caseFile", verb: "Read", label: "Felix Marsh's case file",
        requires: "felixNamed", reqLabel: "Needs a name from the bank",
        reveal: `A thin file, mostly ruin. Felix Marsh, locksmith, lost his savings when a fund manager defrauded his clients. The fund's reclusive backer, the multimillionaire <strong>Nicholas Neo</strong>, repaid every investor from his own pocket. Felix <strong>refused the money</strong> — too proud to take charity from a rich man — and chose a grudge instead. Six years of silence. Then a painted card in a bank's morning post.`,
        effects: { set: ["caseFileSeen"] },
      },
      {
        id: "insurance", verb: "Pull", label: "the bank's insurance schedule",
        reveal: `Marlowe & Finch's five most valuable boxes, declared for cover. Gold. Bearer bonds. A collection of stamps. The tenor <strong>Belloni</strong>'s box, lightly insured. And, alone in its phrasing, <strong>Box 35</strong> — holder <em>N. Neo</em> — contents declared in a single word: <strong>“priceless.”</strong> No figure. No itemization. Just the word.`,
        effects: { set: ["insuranceSeen"] },
      },
    ],
  },
  {
    id: "workshop", name: "Felix's Workshop", sub: "Locked Premises · Bermondsey", locked: true,
    x: 82, y: 28,
    blurb: "Cold now, and orderly the way a careful man keeps a place. A practice vault door stands bolted to the brick. Everything here was rehearsal for somewhere else.",
    hotspots: [
      {
        id: "practiceVault", verb: "Examine", label: "the practice vault door",
        reveal: `A full vault door, bolted to the workshop wall and drilled a hundred times over — the same door the bank uses, or near enough. The floor beneath is bright with metal filings. He has done this entry, in the dark of his head, more times than you can count.`,
      },
      {
        id: "fool", verb: "Unpin", label: "the card above the door",
        reveal: `Pinned dead-centre above the practice door, where a man would see it every working hour: <strong>The Fool</strong>, numbered <strong>0</strong> — a figure stepping cheerfully off a cliff-edge into open air. The pin has rusted into the plaster. It has hung here a long time. It is his, and it joins <em>The Cards</em>.`,
        addCard: "fool", effects: { set: ["foolFound"] },
      },
      {
        id: "calendar", verb: "Photograph", label: "the wall calendar",
        isImage: "calendar",
        image: "/workshop_calendar.png",
        reveal: `A cheap wall calendar, June showing. One date is ringed in pencil, gone over and over until the lead tore the paper and dented the plaster behind: <strong>the 11th</strong>. No note beside it. No reason given. Just the ring, pressed hard enough to mean something — or to look as though it does.`,
        effects: { set: ["calendarSeen"] },
      },
      {
        id: "keys", verb: "Search", label: "the wall of orphaned keys",
        reveal: `Dozens of keys on numbered hooks, every tag aged to the same brown — except one, newer than the rest, the ink barely faded: <strong>“The Crown &amp; Anchor, cellar — NOT FINISHED.”</strong> A job he never came back to close.`,
        effects: { set: ["pubUnlocked"], unlock: ["pub"], unlockToast: { title: "New location", msg: "<b>The Crown &amp; Anchor</b> is open to you." } },
      },
    ],
  },
  {
    id: "opera", name: "Royal Opera House", sub: "Stage Door · Covent Garden", locked: true,
    x: 16, y: 30,
    blurb: "Rope and dust and gold paint. Belloni's name is on every poster outside. Whatever brought him to a bank vault three times in a week, it followed him here.",
    hotspots: [
      {
        id: "doorkeeper", verb: "Ask", label: "the stage doorkeeper",
        reveal: `The old doorkeeper knows Belloni's habits to the minute. <span class="speak">“Before every opening night he sends a boy to fetch a little parcel from the bank, and the morning after he sends it straight back. Never opens it where anyone can see. Superstition, with singers — you learn not to ask.”</span>`,
        effects: { set: ["operaDoorkeeper"] },
      },
      {
        id: "dresser", verb: "Ask", label: "the tenor's dresser",
        requires: "operaDoorkeeper", reqLabel: "Ask the doorkeeper first",
        reveal: `The dresser lowers her voice. <span class="speak">“It's his mother's brooch. She sang here, before him. He wears it pinned inside his waistcoat, against the heart, where not a soul in the house will ever see it. He'd sooner lose his voice than go on without it.”</span> A parcel from a vault, three times in a week. A son who misses his mother. Nothing here is missing, and nothing is strange.`,
        effects: { set: ["operaDresser"] },
      },
      {
        id: "propRoom", verb: "Search", label: "the prop room and its locks",
        reveal: `Among the prop locks Felix once serviced for the theatre, slipped behind a flat of painted scenery, a single card: the <strong>Seven of Swords</strong> — a figure carrying off five blades and leaving two standing behind him. Left here, not mailed. It joins <em>The Cards</em>, though it keeps no numeral's place in the morning count.`,
        addCard: "seven", effects: { set: ["sevenFound"] },
      },
    ],
  },
  {
    id: "pub", name: "The Crown & Anchor", sub: "Public House · Rotherhithe", locked: true,
    x: 74, y: 74,
    blurb: "Sawdust, sour ale, and a fire that hasn't been lit since spring. The landlady knows the name before you finish saying it.",
    hotspots: [
      {
        id: "landlady", verb: "Ask", label: "the landlady about Felix",
        reveal: `<span class="speak">“Felix? Course I knew Felix. Rebuilding my cellar door all winter, good work too — then one week in spring he just stopped coming.”</span> She nods at the wall. <span class="speak">“Left his tab unpaid and his own tankard still on the hook. Not like him. Something took him off and never gave him back.”</span>`,
        effects: { set: ["pubLandlady"] },
      },
      {
        id: "cellar", verb: "Examine", label: "the unfinished cellar door",
        requires: "pubLandlady", reqLabel: "Ask the landlady first",
        reveal: `Half a lock set into the old door and stopped there — like a sentence broken off mid-word. The work is immaculate as far as it goes. His tools are still in their canvas roll on the floor, laid out in order, waiting for a hand that stopped coming in spring. Honest work, abandoned. It says everything about the man and points nowhere.`,
        effects: { set: ["pubCellar"] },
      },
    ],
  },
];

/* ---------- CARD ARRIVALS (event-driven) ---------- */
// The Wheel is present from the intro. Others arrive on conditions.
export const CARD_EVENTS = {
  hermit: {
    flag: "hermitArrived", card: "hermit", date: "June 5",
    toast: { title: "June 5 · New card", msg: "<b>The Hermit</b> — IX — arrived in the morning post." },
    line: "A lantern, and in it no star but a painted full moon.",
  },
  strength: {
    flag: "strengthArrived", card: "strength", date: "June 6",
    toast: { title: "June 6 · New card", msg: "<b>Strength</b> — VIII — arrived, on schedule." },
    line: "It comes with no message at all. Only the numeral, one lower again.",
  },
};

/* ---------- THE CARDS screen captions (date + location only) ---------- */
export const CARD_CAPTIONS = {
  wheel: { date: "June 4", where: "Received at the bank" },
  hermit: { date: "June 5", where: "Received at the bank" },
  strength: { date: "June 6", where: "Received at the bank" },
  fool: { date: "—", where: "Found in Felix's workshop" },
  seven: { date: "—", where: "Found at the Royal Opera House" },
  wheel_original: { date: "—", where: "Vesna's original" },
  hermit_original: { date: "—", where: "Vesna's original" },
};

/* ---------- FAILURE + SUCCESS SCENES ---------- */
export const OUTCOMES = {
  wrongNight: {
    kicker: "Stakeout · futile",
    title: "No one came",
    body: () => `<p>You set the watch and waited it out in the dark of the vault corridor. The hours passed. The grate never moved. By the time the morning shift arrived, the vault stood exactly as you had left it.</p>
      <p>The ambush was futile. No one came.</p>`,
    q: "Then the night was wrong. Go back to the facts and read them again — without assuming what they seem to say.",
  },
  trapHour: {
    kicker: "Stakeout · futile",
    title: "No one came",
    body: () => `<p>You set the watch and waited it out in the dark of the vault corridor. The hours passed. The grate never moved. By the time the morning shift arrived, the vault stood exactly as you had left it.</p>
      <p>The ambush was futile. No one came.</p>`,
    q: "The hour was wrong. Go back to the facts and read them again — without assuming what they seem to say.",
  },
  wrongHour: {
    kicker: "Stakeout · futile",
    title: "No one came",
    body: () => `<p>You set the watch and waited it out in the dark of the vault corridor. The hours passed. The grate never moved. By the time the morning shift arrived, the vault stood exactly as you had left it.</p>
      <p>The ambush was futile. No one came.</p>`,
    q: "The hour was wrong. Go back to the facts and read them again — without assuming what they seem to say.",
  },
};

export const DATES = Array.from({ length: 30 }, (_, i) => i + 1);
