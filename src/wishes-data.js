/* ============================================================
   wishes-data.js — the contents of Box Thirty-Five.
   One entry = one card on the mantel.
   Each `items[]` is rendered in order on the open card.

   Item shapes:
     { type:"text",  from:"Name", body:"Their message…" }
     { type:"text",  from:"Name", src:"/wishes/name.md" }   // loaded at runtime
     { type:"photo", src:null,    label:"…" }
     { type:"audio", src:null,    label:"…", duration:"0:42" }
     { type:"video", src:null,    label:"…", autoplay:false, loop:false }

   For text, `src` (a URL — typically a .md file in /public/wishes/)
   takes precedence over `body`. Blank lines split into paragraphs;
   no other markdown is parsed. `body` is used as a fallback if the
   fetch fails. Leave a media `src` null to show a drop-placeholder.
   Video `autoplay:true` starts the clip muted on open (browsers
   block unmuted autoplay); the user can unmute via the controls.
   ============================================================ */

export const WISHES = [
  {
    slot: 1,
    name: "Loong",
    items: [
      { type: "text", from: "Loong", src:"/wishes/loong.md" },
      { type: "photo", src: "/wishes/loong.jpeg", label:"" },
      { type: "photo", src: "/wishes/loong1.jpeg", label:"" },
      { type: "photo", src: "/wishes/loong2.jpeg", label:"" },
      { type: "photo", src: "/wishes/loong3.jpeg", label:"" },
      { type: "photo", src: "/wishes/loong4.jpeg", label:"" },
      { type: "audio", src: null, label: "The whole pub, last orders, singing for you", duration: "0:51" },
    ],
  },
  {
    slot: 2,
    name: "Reka & Youn",
    items: [
      { type: "text", from: "Youn", src: "/wishes/youn.md" },
      { type: "text", from: "Reka", src: "/wishes/reka.md" },
      { type: "photo", src: "/wishes/reka.jpeg" },
      { type: "photo", src: "/wishes/reka1.jpeg" },
    ],
  },
  {
    slot: 3,
    name: "Jason, Angelin & Theo",
    items: [
      { type: "text", from: "Jason, Angelin & Theo", src: "/wishes/jason.md" },
      { type: "video", src: "/wishes/jason.mp4", autoplay: true, loop: true },
    ],
  },
  {
    slot: 4,
    name: "Amethyst & Shawn",
    items: [
      { type: "text", from: "Amethyst", src: "/wishes/amethyst.md" },
      { type: "video", src: "/wishes/amethyst.mp4" },
      { type: "photo", src: "/wishes/amethyst.jpeg" },
      { type: "photo", src: "/wishes/amethyst1.jpeg" },
    ],
  },
  {
    slot: 5,
    name: "Ching Kit & Family",
    items: [
      { type: "text", from: "Ching Kit", src: "/wishes/chingkit.md" },
      { type: "photo", src: "/wishes/chingkit.jpeg" },
    ],
  },
  {
    slot: 6,
    name: "Derry & Family",
    items: [
      { type: "video", src: "/wishes/derry.mp4" },
    ],
  },
  {
    slot: 7,
    name: "Desmond & Pearlina",
    items: [
      { type: "video", src: "/wishes/desmond.mp4" },
    ],
  },
  {
    slot: 8,
    name: "Weiting, Dan, Zahra & Zoey",
    items: [
      { type: "video", src: "/wishes/weiting.mp4" },
      { type: "video", src: "/wishes/dan.mp4" },
    ],
  },
  {
    slot: 9,
    name: "Joan & Masa",
    items: [
      { type: "video", src: "/wishes/joan.mp4" },
      { type: "video", src: "/wishes/masa.mp4" },
    ],
  },
  {
    slot: 10,
    name: "Ha",
    items: [
      { type: "text", from: "Ha", src: "/wishes/ha.md" },
    ],
  },
  {
    slot: 11,
    name: "Johan",
    items: [
      { type: "text", from: "Johan", src: "/wishes/johan.md" },
      { type: "photo", src: "/wishes/johan.jpeg" },
    ],
  },
  {
    slot: 12,
    name: "Junhao",
    items: [
      // { type: "text", from: "Johan", src: "/wishes/johan.md" },
      // { type: "photo", src: "/wishes/johan.jpeg" },
    ],
  }
];
