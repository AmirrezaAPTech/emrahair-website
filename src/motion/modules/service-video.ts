import { prefersReducedMotion, qsa, type Teardown } from '../lib/env';

/**
 * The service cards' looping previews.
 *
 * Four clips of the actual rooms, muted and endless. Three rules govern the
 * whole module:
 *
 *   1. Only the opening frame is fetched up front. The markup ships
 *      `preload="metadata"` against a `#t=0.001` fragment, which is what puts a
 *      real still on the card without pulling the file down; the body of the
 *      clip is not requested until play() is called here. A visitor who never
 *      scrolls to the services row never downloads four videos.
 *   2. Only what is on screen plays. Off-screen clips are paused, not merely
 *      hidden — decoding four videos nobody is looking at is what turns a
 *      background loop into a flat battery.
 *   3. Reduced motion keeps the still. An autoplaying loop is exactly the kind
 *      of motion that setting exists to stop, so those visitors hold the
 *      opening frame and the rest of the clip is never requested.
 *
 * The clips are decorative and silent by construction: `muted` is what makes
 * autoplay permissible at all, and the element carries the room's description
 * as an `img` in the markup, so there is nothing here to announce.
 */

/** Load a little before the card arrives, so the loop is running on entry. */
const ROOT_MARGIN = '200px 0px';

export const initServiceVideo = (): Teardown => {
  const videos = qsa<HTMLVideoElement>('[data-svc-video]');
  if (!videos.length) return () => {};

  // The opening frame is already painted and already correct. Leaving it is the
  // whole behaviour for these visitors.
  if (prefersReducedMotion()) return () => {};

  // A browser without IntersectionObserver keeps the opening frames rather than
  // downloading four videos it cannot schedule.
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const play = (video: HTMLVideoElement) => {
    // `muted` is set in the markup, but Safari has historically dropped it when
    // the element is created by the parser and hydrated after. Autoplay is
    // refused outright if it is not true at the moment play() is called.
    video.muted = true;
    // Rejects when the tab is backgrounded or the decoder is busy. Neither is
    // an error worth surfacing — the still is what stays on the card.
    void video.play().catch(() => {});
  };

  // Which clips are on screen right now, so returning to the tab resumes those
  // and only those. Reading it back off the observer is not possible.
  const onScreen = new Set<HTMLVideoElement>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          onScreen.add(video);
          play(video);
        } else {
          onScreen.delete(video);
          video.pause();
        }
      });
    },
    { rootMargin: ROOT_MARGIN, threshold: 0 }
  );

  videos.forEach((video) => observer.observe(video));

  // A backgrounded tab suspends decoding anyway; pausing explicitly means the
  // loops do not all resume mid-frame and fight for the decoder on return.
  const onVisibility = () => {
    if (document.hidden) videos.forEach((video) => video.pause());
    else onScreen.forEach(play);
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    onScreen.clear();
    videos.forEach((video) => video.pause());
  };
};
