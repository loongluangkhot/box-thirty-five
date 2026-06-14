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
    id: "wheel", name: "The Wheel of Fortune", roman: "X",
    img: "/wheel_of_fortune_altered.png",
  },
  wheel_original: {
    id: "wheel_original", name: "The Wheel of Fortune", roman: "X",
    img: "/wheel_of_fortune_original.png", reference: true,
  },
  hermit: {
    id: "hermit", name: "The Hermit", roman: "IX",
    img: "/hermit_altered.png",
  },
  hermit_original: {
    id: "hermit_original", name: "The Hermit", roman: "IX",
    img: "/hermit_original.png", reference: true,
  },
  strength: {
    id: "strength", name: "Strength", roman: "VIII",
    img: "/strength.png",
  },
  fool: {
    id: "fool", name: "The Fool", roman: "0", img: "/fool.png",
  },
  seven: {
    id: "seven", name: "Seven of Swords", roman: "VII",
    img: "/seven_of_swords.png",
  },
};

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
        reveal: `Years of signatures for work on the locks and the vault door. One name recurs through the early entries, the contractor who overhauled the mechanism six years ago: <strong>FELIX MARSH, locksmith</strong>.`,
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
        id: "showCard", q: "Show her the Wheel of Fortune card",
        requires: "openedEnvelope",
        a: `She turns the Wheel over in her hands and her mouth tightens. <span class="speak">“The card design looks so similar to my own deck! Someone must have copied them — someone with artisanal talents. However, a trained eye will be able to spot the differences between this and my original deck.”</span>`,
      },
      {
        id: "borrowDeck", q: "Borrow her original deck",
        requires: "askedShowCard",
        a: `She wraps the deck in black silk and presses it into your hands. <span class="speak">“Mine are honest. Lay them beside the forgeries on your own table. Where they differ, the copyist meant something.”</span> Vesna's true cards now sit on the table beside yours.`,
        effects: { set: ["borrowedDeck"], addCards: ["wheel_original", "hermit_original"] },
      },
      {
        id: "askFelix", q: "Ask about Felix Marsh",
        requires: "felixNamed",
        a: `<span class="speak">“Felix. Yes — a client from years ago, and an avid tarot reader himself, better than most.”</span> She almost smiles. <span class="speak">“But he never read under his own name. In the circle, he goes by the alias <strong>The Fool</strong> — the wanderer who carries nothing, fears nothing. He has a peculiar way of reading his cards…”</span> Vesna furrows her brows. <span class="speak">“Felix cut the deck upside down. Every card he read <strong>reversed</strong> — always. ‘Fortune only tells me the truth standing on its head,’ he used to say. It drove the others mad. He never once read a card the right way up.”</span>`,
      },
    ],
    hotspots: [
      {
        id: "almanac", verb: "Study", label: "the lunar almanac on the shelf",
        image: "/lunar_almanac.png",
        reveal: `An almanac, open to <strong>June</strong>. The month's phases are marked clearly on the almanac.`,
        effects: { set: ["almanacSeen"] },
      },
      {
        id: "crystal", verb: "Glance at", label: "the crystal ball",
        reveal: `You lean toward the glass, and see your own face, upside down and small. <em>Hmm, I wonder if this crystal ball will tell me anything useful…</em>`,
      },
    ],
  },
  {
    id: "yard", name: "Scotland Yard", sub: "Records & Case Files · Embankment",
    x: 48, y: 54,
    blurb: "Green-shaded lamps and the rustle of paper. Down here the dead cases sleep in boxes. Yours is wide awake, and getting louder by the morning.",
    hotspots: [
      {
        id: "insurance", verb: "Pull", label: "the bank's insurance schedule",
        reveal: `The schedule shows Marlowe &amp; Finch's safes that are covered by insurance. The top five most valuable safes are:
        <ul style="margin:10px 0 0; padding-left:18px">
          <li><strong>Box 12</strong> — Enrico Belloni — Assorted heirlooms. Original music scrolls by Andrea Bocelli, of whom Enrico was the protégé.</li>
          <li><strong>Box 35</strong> — Dr. Nicholas Neo — Contents declared in a single word: <strong>“priceless.”</strong></li>
          <li><strong>Box 52</strong> — Taylor Swift — Longhand love letters from ex-boyfriends.</li>
          <li><strong>Box 78</strong> — Elon Musk — Bearer bonds, share certificates. <em>(and perhaps some dirty secrets too?)</em></li>
          <li><strong>Box 96</strong> — Queen Victoria — Jewellery, fully appraised.</li>
        </ul>`,
        effects: { set: ["insuranceSeen"] },
      },
      {
        id: "caseFile", verb: "Read", label: "Felix Marsh's bio",
        requires: "felixNamed",
        reveal: `No past criminal records. Felix Marsh, locksmith, lost his savings last year when a fund manager defrauded his clients. The fund's reclusive backer, the multimillionaire <strong>Nicholas Neo</strong>, repaid every investor from his own pocket. Felix <strong>refused the money</strong> — too proud to take charity from a rich man.`,
        effects: { set: ["caseFileSeen"] },
      },
      {
        id: "belloniBio", verb: "Read", label: "Enrico Belloni's bio",
        reveal: `Petty crimes during his teenage years. Used to be involved with the Italian mafia. Now, he's a well-respected, well-paid member of the Opera, and a famous philanthropist and patron of the arts. A true inspiration to kids who grew up rough. <em>Is this heroic front just a façade?</em>`,
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
        reveal: `Pinned dead-centre above the practice door, where a man would see it every working hour: <strong>The Fool</strong>, numbered <strong>0</strong>. It joins <em>The Cards</em>.`,
        addCard: "fool", effects: { set: ["foolFound"] },
      },
      {
        id: "calendar", verb: "Photograph", label: "the wall calendar",
        image: "/workshop_calendar.png",
        reveal: `A cheap wall calendar, June showing. One date is ringed in pencil, gone over and over until the lead tore the paper: <strong>the 11th</strong>.`,
        effects: { set: ["calendarSeen"] },
      },
      {
        id: "keys", verb: "Search", label: "the wall of orphaned keys",
        reveal: `Dozens of keys on numbered hooks, every tag aged to the same brown — except one, newer than the rest, the ink barely faded: <strong>“The Crown &amp; Anchor, cellar — NOT FINISHED.”</strong>`,
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
        id: "dressingRoom", verb: "Search", label: "Enrico's dressing room",
        reveal: `You look around the extravagant gilded dressing room that must have been called a second home by many Opera legends. A single card jumps out to you amongst all the items on the vanity: the <strong>Seven of Swords</strong> — a thief carrying off five blades and leaving two standing behind him. It joins <em>The Cards</em>.`,
        addCard: "seven", effects: { set: ["sevenFound"] },
      },
      {
        id: "doorkeeper", verb: "Ask", label: "the stage doorkeeper",
        reveal: `The old doorkeeper knows Belloni's habits to the minute. <span class="speak">“Before every opening night he sends a boy to fetch a little parcel from the bank, and the morning after he sends it straight back. Never opens it where anyone can see. Superstition, with singers — you learn not to ask.”</span>`,
        effects: { set: ["operaDoorkeeper"] },
      },
      {
        id: "dresser", verb: "Ask", label: "the tenor's dresser",
        requires: "operaDoorkeeper",
        reveal: `The dresser lowers her voice and whispers in a thick Italian accent: <span class="speak">“It's his mother's brooch. She passed when he was just a bambino. He wears it pinned inside his waistcoat, against the heart — some kind of lucky charm. Poor boy misses his mama every single day.”</span>`,
        effects: { set: ["operaDresser"] },
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
        reveal: `<span class="speak">“Felix? Course I knew Felix. Rebuilding my cellar door all winter, good work too — then one week in spring last year he just stopped coming.”</span> She nods at the wall. <span class="speak">“Left his tab unpaid too. Not like him. Something took him off and never gave him back.”</span>`,
        effects: { set: ["pubLandlady"] },
      },
      {
        id: "cellar", verb: "Examine", label: "the unfinished cellar door",
        requires: "pubLandlady",
        reveal: `The work is immaculate as far as it goes. This Felix Marsh must be quite a master at his craft. His tools are still in their canvas roll on the floor, laid out in order, abandoned.`,
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
    line: "A lantern, and in it no star but a painted full moon.",
  },
  strength: {
    flag: "strengthArrived", card: "strength", date: "June 6",
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
const NO_ONE_CAME_BODY = `<p>You set the watch and waited it out in the dark of the vault corridor. The hours passed. The grate never moved. By the time the morning shift arrived, the vault stood exactly as you had left it.</p>
  <p>The ambush was futile. No one came.</p>`;

export const OUTCOMES = {
  wrongNight: {
    kicker: "Stakeout · futile",
    title: "No one came",
    body: NO_ONE_CAME_BODY,
    q: "Then the night was wrong. Go back to the facts and read them again — without assuming what they seem to say.",
  },
  trapHour: {
    kicker: "Stakeout · futile",
    title: "No one came",
    body: NO_ONE_CAME_BODY,
    q: "The hour was wrong. Go back to the facts and read them again — without assuming what they seem to say.",
  },
  wrongHour: {
    kicker: "Stakeout · futile",
    title: "No one came",
    body: NO_ONE_CAME_BODY,
    q: "The hour was wrong. Go back to the facts and read them again — without assuming what they seem to say.",
  },
};
