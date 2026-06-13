/* Generate a square favicon.png from public/card_back.png.
 * The source is portrait (~650×1118); we fit it into a square canvas,
 * centred, with transparent padding so the aspect ratio is preserved
 * when browsers render it in the square favicon slot.
 *
 * Run: node scripts/make-favicon.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "public", "card_back.png");
const OUT = join(__dirname, "..", "public", "favicon.png");
const SIZE = 256;

const img = sharp(SRC);
const meta = await img.metadata();
const longer = Math.max(meta.width, meta.height);
const targetLong = SIZE - 8; // tiny breathing room
const scale = targetLong / longer;
const w = Math.round(meta.width * scale);
const h = Math.round(meta.height * scale);

await sharp(SRC)
  .resize(w, h, { fit: "inside" })
  .extend({
    top: Math.floor((SIZE - h) / 2),
    bottom: Math.ceil((SIZE - h) / 2),
    left: Math.floor((SIZE - w) / 2),
    right: Math.ceil((SIZE - w) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(OUT);

console.log(`Wrote ${OUT} (${SIZE}x${SIZE})`);
