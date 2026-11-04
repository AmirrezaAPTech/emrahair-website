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

const HERO = src('stock', '4587909-uhd_3840_2160_25fps.mp4');
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

/* --- Hero: wind through dark hair on espresso. 10.4s, looped. ------------ */
video(out('public/videos/hero/hero-desktop.mp4'), ['-i', HERO], `scale=1920:-2,${GRADE}`, 27);
video(out('public/videos/hero/hero-mobile.mp4'), ['-i', HERO], `crop=ih*9/16:ih:(iw-ih*9/16)/2+iw*0.02:0,scale=720:-2,${GRADE}`, 28);
poster(out('src/assets/images/hero-poster-desktop.jpg'), HERO, 4, `scale=1920:-2,${GRADE}`);
poster(out('src/assets/images/hero-poster-mobile.jpg'), HERO, 4, `crop=ih*9/16:ih:(iw-ih*9/16)/2+iw*0.02:0,scale=720:-2,${GRADE}`);

/* --- Closing band: caramel balayage in warm light. 4–14s: the first three
   seconds are an empty wall. Taken down a stop to sit in a dark band. ----- */
const DARK = `${GRADE},eq=brightness=-0.10:saturation=0.9`;
video(out('public/videos/invitation/invitation.mp4'), ['-ss', '4', '-t', '10', '-i', INVITE], `scale=1600:-2,${DARK}`, 29);
poster(out('src/assets/images/invitation-poster.jpg'), INVITE, 8, `scale=1600:-2,${DARK}`);

/* --- Reels: Emrah's own work, lighter for the web. ----------------------- */
for (const n of [1, 2, 3, 4]) {
  const input = src('reels', `${n}.mp4`);
  video(out(`public/videos/reels/${n}.mp4`), ['-i', input], 'scale=540:-2', 30);
  poster(out(`src/assets/images/reels/${n}.jpg`), input, 1.5, 'scale=540:-2');
}

/* --- Service-card clips: 5s loops. --------------------------------------
   Four from the clips used on the Panfili site (media-src/panfili-clips/),
   chosen by the client; "care" stays on Emrah's own reel because neither of
   the remaining Panfili clips (a facial machine, make-up) is a service this
   salon offers. */
const clips = {
  color: [src('panfili-clips', 'hair.mp4'), 0.5],   // blow-dry on blonde hair
  cut: [src('panfili-clips', 'hair.mp4'), 10],      // the finished cut, revealed
  care: [src('reels', '4.mp4'), 9],                 // soft waves after treatment
  bridal: [src('panfili-clips', 'bridal.mp4'), 4],  // bridal styling and the dress
  beauty: [src('panfili-clips', 'nails.mp4'), 2],   // nail work
};
for (const [key, [input, t]] of Object.entries(clips)) {
  video(out(`public/videos/services/${key}.mp4`), ['-ss', String(t), '-t', '5', '-i', input], 'scale=480:-2', 30);
}

/* --- Stills: the gallery, from the reels at full resolution. -------------- */
const stills = {
  'work-balayage-front': [3, 12],
  'work-balayage-back': [3, 24],
  'work-brunette-volume': [2, 15],
  'work-brunette-waves': [4, 12],
  'work-foils': [1, 15],
  'work-blowout': [2, 21],
  'work-finish': [3, 18],
  'work-brunette-glow': [4, 21],
};
for (const [name, [n, t]] of Object.entries(stills)) {
  poster(out(`src/assets/images/work/${name}.jpg`), src('reels', `${n}.mp4`), t, 'scale=720:-2');
}

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

/* --- Emrah's roster card: his face from the ritual photograph, the one
   where the apron reads "EMRAH". (about-main.png came from Schwarzkopf
   Pro TR's feed and is not confirmed to be him, so it is never captioned
   with his name.) ---------------------------------------------------------- */
fs.mkdirSync(out('src/assets/images/team'), { recursive: true });
await sharp(src('photos', 'ritual.jpg'))
  .extract({ left: 250, top: 60, width: 520, height: 650 })
  .resize(640, 800)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out('src/assets/images/team/emrah.jpg'));
console.log('portrait done');
