/**
 * Builds every web asset from media-src/.
 *
 *   media-src/stock/   Pexels originals (free licence): the hero and the
 *                      closing band. 4587909 by Ketut Subiyanto, 8956142 by
 *                      KoolShooters.
 *   media-src/reels/   @emrahair's own reels (as published on the salon site).
 *   media-src/photos/  the salon's photographs.
 *
 * Run: npm run media   (needs the ffmpeg-static devDependency)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const src = (...p) => path.join(root, 'media-src', ...p);
const out = (...p) => path.join(root, ...p);
const mk = (f) => fs.mkdirSync(path.dirname(f), { recursive: true });

const ff = (args) => execFileSync(ffmpeg, ['-y', '-v', 'error', ...args], { stdio: 'inherit' });

// Hero: Pexels 8956111 (KoolShooters), the client's pick. Was 4587909.
const HERO = src('stock', '8956111-uhd_3840_2160_24fps.mp4');
const INVITE = src('stock', '8956142-uhd_3840_2160_24fps.mp4');

const x264 = (crf) => ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
// A touch of the house grade: warmer, a little less saturated, slightly lifted blacks.
const GRADE = 'eq=saturation=0.88:contrast=1.04:brightness=-0.02,colorbalance=rs=0.04:gs=0.01:bs=-0.04';

function video(file, inputArgs, vf, crf) {
  mk(file);
  ff([...inputArgs, '-vf', vf, ...x264(crf), file]);
  console.log('video ', path.relative(root, file), Math.round(fs.statSync(file).size / 1024) + 'KB');
}

function poster(file, input, t, vf) {
  mk(file);
  ff(['-ss', String(t), '-i', input, '-frames:v', '1', '-vf', vf, '-q:v', '3', file]);
}

/* --- Hero: balayage in window light, 17s, looped. ------------------------- */
const HERO_V = 'scale=1920:-2';
const HERO_M = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=720:-2';
video(out('public/videos/hero/hero-desktop.mp4'), ['-i', HERO], HERO_V, 26);
video(out('public/videos/hero/hero-mobile.mp4'), ['-i', HERO], HERO_M, 27);
poster(out('src/assets/images/hero-poster-desktop.jpg'), HERO, 2, HERO_V);
poster(out('src/assets/images/hero-poster-mobile.jpg'), HERO, 2, HERO_M);

/* --- Closing band: caramel balayage in warm light. 4–14s: the first three
   seconds are an empty wall. Taken down a stop to sit in a dark band. ----- */
const DARK = `${GRADE},eq=brightness=-0.10:saturation=0.9`;
video(out('public/videos/invitation/invitation.mp4'), ['-ss', '4', '-t', '10', '-i', INVITE], `scale=1600:-2,${DARK}`, 29);
poster(out('src/assets/images/invitation-poster.jpg'), INVITE, 8, `scale=1600:-2,${DARK}`);

/* --- Reels: Emrah's own work, lighter for the web. ----------------------- */
/* Copied, not re-encoded: the sources are already 720x1280 web encodes, and
   every further pass at a lower size was visibly softer. */
for (const n of [1, 2, 3, 4]) {
  const file = out(`public/videos/reels/${n}.mp4`);
  mk(file);
  fs.copyFileSync(src('reels', `${n}.mp4`), file);
  console.log('copy  ', path.relative(root, file), Math.round(fs.statSync(file).size / 1024) + 'KB');
}

/* --- Service-card films: the salon's own, one per card (2026-11-08). ----
   The client's edits, "<card title>.mp4" from Downloads, copied to
   media-src/cards/<key>.mp4 (git-ignored originals, 1080x1350, 7–10 s).
   Encoded whole at 600x750 (the plate is 4:5), muted. Each card and its
   service page share the file. Bump CLIP_VERSION in ServicesGrid.tsx and
   ServicePage.tsx after re-encoding.
     color   Balyaj & Air Touch      cut     Saç Kesimi & Fön
     dye     Saç Boyama & Dip Boya   care    Keratin & Saç Bakımı
     bridal  Gelin Saçı & Topuz      beauty  Manikür & Pedikür */
const clips = ['color', 'dye', 'cut', 'care', 'bridal', 'beauty'];
for (const key of clips) {
  const file = out(`public/videos/services/${key}.mp4`);
  mk(file);
  ff(['-i', src('cards', `${key}.mp4`), '-an', '-vf', 'scale=600:750:flags=lanczos,fps=30', '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file]);
  console.log('video ', path.relative(root, file), Math.round(fs.statSync(file).size / 1024) + 'KB');
}

/* Posters for the service pages' hero film: its opening frame, so the page
   paints a picture before the video has loaded (and for Reduce Motion). */
for (const key of clips) {
  poster(out(`src/assets/images/services/${key}.jpg`), out(`public/videos/services/${key}.mp4`), 0.3, 'scale=600:-2');
}

/* --- Çalışmalar: the client's order (2026-11-08). The four edited films
   (editedB, E, F, G from Downloads, copied to media-src/work-videos/,
   git-ignored) come first, cropped to the 3:4 plate a little above centre so
   faces stay in frame. All four at the same size as the other tiles.
   Then the photographs from the earlier Çalışmalar files (the HEIC ones
   converted with Windows' decoder, see media-src/calismalar/README.md). --- */
for (const [key, w, crf] of [['b', 720, 29], ['e', 720, 28], ['f', 720, 28], ['g', 720, 28]]) {
  const input = src('work-videos', `edited-${key}.mp4`);
  const file = out(`public/videos/work/edited-${key}.mp4`);
  mk(file);
  const cap = key === 'b' ? ['-maxrate', '3500k', '-bufsize', '7000k'] : [];
  ff(['-i', input, '-an', '-vf', `crop=1080:1440:0:168,scale=${w}:-2:flags=lanczos,fps=30`, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(crf), ...cap, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file]);
  poster(out(`src/assets/images/work/edited-${key}-poster.jpg`), file, 0.5, 'null');
}
for (const name of ['01-A', '03-A', '04-B', '06-C', '08-E']) {
  const from = fs.existsSync(src('calismalar', `${name}.jpg`)) ? `${name}.jpg` : `${name}.png`;
  const file = out(`src/assets/images/work/${name}.jpg`);
  mk(file);
  await sharp(src('calismalar', from)).rotate().resize({ width: 1200, height: 1600, fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
}
console.log('work media done');

/* --- The salon's photographs. -------------------------------------------- */
const photos = {
  'ritual.jpg': 'ritual.jpg', // Emrah at work against the brick wall
  'about-main.jpg': 'about-main.png', // the finish, at the mirror
  'salon-terrace.jpg': 'salon-google.jpg', // the terrace lounge
  // The salon's Google Maps photographs (Inside / Exterior):
  'salon/stations.jpg': 'maps-m07.jpg', // styling stations, oak and plants
  'salon/terrace.jpg': 'maps-m13.jpg', // the terrace lounge under the pergola
  'salon/product-wall.jpg': 'maps-m08.jpg', // the orange feature wall
  'salon/panelled-wall.jpg': 'maps-m05.jpg', // white panelling, brass mirror
  'salon/terrace-chairs.jpg': 'maps-m11.jpg', // terrace armchairs
};
for (const [to, from] of Object.entries(photos)) {
  const file = out('src/assets/images', to);
  mk(file);
  await sharp(src('photos', from))
    .rotate()
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(file);
  console.log('image ', path.relative(root, file));
}

/* --- Social card and icons. ---------------------------------------------- */
await sharp(src('photos', 'ritual.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .modulate({ brightness: 0.82 })
  .jpeg({ quality: 82 })
  .toFile(out('public/og-emrahair.jpg'));
console.log('done');
