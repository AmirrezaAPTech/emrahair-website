/**
 * Share images (Open Graph / WhatsApp / X previews), 1200 × 630, one per page.
 * Built from the full-resolution sources rather than the web posters, so a
 * link pasted into WhatsApp shows a sharp photograph of that very service.
 * Also writes the Apple touch icon.
 *
 * Run: node scripts/build-og.mjs   (needs ffmpeg-static and sharp)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const out = (n) => path.join(root, 'public', 'og', `${n}.jpg`);
fs.mkdirSync(path.join(root, 'public', 'og'), { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));

/** A frame from a video, full resolution. */
function frame(video, t) {
  const f = path.join(tmp, `${path.basename(video)}-${t}.png`);
  execFileSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', f]);
  return f;
}

const stock = (f) => path.join(root, 'media-src', 'stock', f);
const img = (f) => path.join(root, 'src', 'assets', 'images', f);

/* page key -> [source image, focal position for the crop] */
const SOURCES = {
  'balyaj': [frame(path.join(root, 'media-src', 'cards', 'color.mp4'), 2), 'attention'],
  'sac-boyama': [frame(path.join(root, 'media-src', 'cards', 'dye.mp4'), 1), 'attention'],
  'sac-kesimi': [frame(path.join(root, 'media-src', 'cards', 'cut.mp4'), 3.5), 'attention'],
  'keratin': [frame(path.join(root, 'media-src', 'cards', 'care.mp4'), 5), 'attention'],
  'gelin-saci': [frame(path.join(root, 'media-src', 'cards', 'bridal.mp4'), 3), 'attention'],
  'manikur-pedikur': [frame(path.join(root, 'media-src', 'cards', 'beauty.mp4'), 0.5), 'attention'],
  'kas-agda': [img('salon/product-wall.jpg'), 'centre'],
  'emrah-cabkur': [img('ritual.jpg'), 'attention'],
  iletisim: [img('salon/terrace.jpg'), 'centre'],
  hizmetler: [img('salon/stations.jpg'), 'centre'],
  blog: [img('work/06-C.jpg'), 'attention'],
  sss: [img('salon/panelled-wall.jpg'), 'centre'],
  'post-ombre-sombre': [img('work/01-A.jpg'), 'attention'],
  'post-kullu-kumral': [img('work/06-C.jpg'), 'attention'],
  'post-keratin-botoks': [img('work/08-E.jpg'), 'attention'],
  'post-amonyaksiz-boya': [img('ritual.jpg'), 'attention'],
  'post-fiyatlar-2026': [img('salon/stations.jpg'), 'centre'],
  'post-gelin-basi': [frame(path.join(root, 'media-src', 'cards', 'bridal.mp4'), 3), 'attention'],
};

/* A bottom band in the house ink with the wordmark, so the preview is
   recognisably the salon's even as a thumbnail. */
const band = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.55" stop-color="#17181b" stop-opacity="0"/>
    <stop offset="1" stop-color="#17181b" stop-opacity="0.85"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="60" y="580" font-family="Georgia, 'Times New Roman', serif" font-size="44" letter-spacing="10" fill="#fbfaf7">EMRAHAIR</text>
  <text x="1140" y="578" text-anchor="end" font-family="Arial, sans-serif" font-size="22" letter-spacing="5" fill="#c9a27b">BAHÇEŞEHİR · İSTANBUL</text>
</svg>`);

for (const [name, [src, position]] of Object.entries(SOURCES)) {
  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: position === 'attention' ? sharp.strategy.attention : 'centre' })
    .modulate({ saturation: 0.94 })
    .composite([{ input: band }])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out(name));
  console.log('og', name, Math.round(fs.statSync(out(name)).size / 1024) + 'KB');
}

/* Apple touch icon: the favicon's plate, 180 px, no transparency (iOS fills it black). */
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="#17181b"/><text x="90" y="124" text-anchor="middle" font-family="Georgia, serif" font-size="104" fill="#c9a27b">E</text></svg>`))
  .png()
  .toFile(path.join(root, 'public', 'apple-touch-icon.png'));
console.log('apple-touch-icon.png');
fs.rmSync(tmp, { recursive: true, force: true });
