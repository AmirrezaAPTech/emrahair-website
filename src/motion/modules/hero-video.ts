import { prefersReducedMotion, qs, type Teardown } from '../lib/env';

/**
 * The hero's moving master.
 *
 * The clip was shot 16:9 and the hero is full-bleed, which on a phone is a box
 * more than twice as tall as the footage is. So it exists as two cuts — the
 * landscape master, and a 9:16 window tracked onto her face — and this is what
 * chooses between them. The breakpoint is the same 767px line the <picture>
 * beneath it uses, so the still and the clip are never art-directed differently
 * from one another.
 *
 * Three rules, in order of how much they save:
 *
 *   1. One cut is ever fetched. Both URLs sit in data attributes and only the
 *      matched one is promoted to a `src`, so a phone never touches the
 *      landscape master and a desktop never touches the vertical.
 *   2. Reduced motion downloads neither. The poster is the clip's own first
 *      frame, so holding it is not a fallback — it is the same picture, still.
 *   3. It plays only while the hero is on screen. The rest of the page is a
 *      long scroll and there is no reason to keep decoding behind it.
 *
 * The still underneath is never removed. It is what shows while the clip loads,
 * what shows if it fails, and what the reveal animation is composed against.
 */

export const initHeroVideo = (): Teardown => {
  const video = qs<HTMLVideoElement>('[data-hero-video]');
  if (!video) return () => {};

  // The poster is the first frame of this very clip. Leaving it is the whole
  // behaviour for these visitors, and it costs them nothing.
  if (prefersReducedMotion()) return () => {};

  const wide = window.matchMedia('(min-width: 768px)');
  const src = wide.matches ? video.dataset.srcDesktop : video.dataset.srcMobile;
  if (!src) return () => {};

  video.src = src;
  // `muted` is set in the markup, but Safari has historically dropped it when
  // the element is parsed and hydrated after. Autoplay is refused outright if
  // it is not true at the moment play() is called.
  video.muted = true;

  const play = () => {
    // Rejects on a backgrounded tab or a busy decoder. Neither is worth
    // surfacing — the still is still underneath.
    void video.play().catch(() => {});
  };

  // Revealed on `playing` rather than on `loadeddata`, so the first frame is on
  // the compositor before anything crossfades. The still never blinks through
  // to an empty plate.
  const onPlaying = () => {
    video.dataset.playing = 'true';
  };
  video.addEventListener('playing', onPlaying);

  play();

  /* Deliberately not rebound on resize. A phone rotated to landscape crosses
     the breakpoint, and swapping the src there would restart the clip from
     black under the headline to trade one crop for another the visitor did not
     ask for. The chosen cut covers both orientations. */

  let observer: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0 }
    );
    observer.observe(video);
  }

  const onVisibility = () => {
    if (document.hidden) video.pause();
    else if (video.getBoundingClientRect().bottom > 0) play();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    video.removeEventListener('playing', onPlaying);
    video.pause();
  };
};
