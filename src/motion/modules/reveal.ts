import { gsap, ScrollTrigger } from '../lib/gsap';
import { isTouchDevice, prefersReducedMotion, qsa, type Teardown } from '../lib/env';

/**
 * Three reveal grammars, used everywhere:
 *
 *   [data-reveal]        blocks rise a short distance and resolve
 *   [data-reveal-line]   a line of display type rises through a fixed mask
 *   [data-reveal-media]  a frame opens from its floor while the image settles
 *
 * All three are set from script rather than CSS, so a failed or blocked bundle
 * leaves a complete, readable page instead of an invisible one.
 */

const START = 'top 88%';

/** The hero runs its own choreographed intro; scroll reveals must not touch it. */
const inHero = (el: Element) => Boolean(el.closest('[data-hero]'));

export const initReveals = (): Teardown => {
  if (prefersReducedMotion()) return () => {};

  const triggers: ScrollTrigger[] = [];

  // --- Blocks ------------------------------------------------------
  const blocks = qsa('[data-reveal]').filter((el) => !inHero(el));
  if (blocks.length) {
    gsap.set(blocks, { opacity: 0, y: 26 });
    triggers.push(
      ...ScrollTrigger.batch(blocks, {
        start: START,
        once: true,
        // Neighbours that enter together leave together, in reading order.
        batchMax: 6,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }),
      })
    );
  }

  // --- Display lines ----------------------------------------------
  // Grouped by heading so each title staggers within itself rather than
  // against whatever else happens to be on screen.
  const groups = new Map<Element, HTMLElement[]>();
  qsa('[data-reveal-line]')
    .filter((el) => !inHero(el))
    .forEach((line) => {
      const owner = line.closest('h1, h2, h3, p, div') ?? line.parentElement ?? line;
      groups.set(owner, [...(groups.get(owner) ?? []), line]);
    });

  groups.forEach((group) => {
    const inners = group
      .map((line) => line.firstElementChild as HTMLElement | null)
      .filter((el): el is HTMLElement => Boolean(el));
    if (!inners.length || !group[0]) return;

    // Past 100 by the mask's own bleed: the window is taller than the line it
    // masks (see .display__line), so a line parked at 108 leaves the tips of
    // its caps showing in the overhang.
    gsap.set(inners, { yPercent: 126 });
    triggers.push(
      ScrollTrigger.create({
        trigger: group[0],
        start: START,
        once: true,
        onEnter: () =>
          gsap.to(inners, { yPercent: 0, duration: 1.25, stagger: 0.085, ease: 'expo.out' }),
      })
    );
  });

  // --- Media frames ------------------------------------------------
  /* Two grammars by input. The frame-opens-from-its-floor wipe animates
     clip-path, and a clip-path in motion repaints the full photograph every
     frame — several of these run at once mid-scroll, which on a phone is felt
     as scroll that is not quite smooth. So touch devices get the cheap
     grammar: the frame fades and rises as one compositor-friendly transform,
     which is the same reveal the text blocks use. Desktops keep the wipe. */
  const cheapMedia = isTouchDevice();
  qsa('[data-reveal-media]')
    .filter((el) => !inHero(el))
    .forEach((frame) => {
      const img = frame.querySelector('img');

      if (cheapMedia) {
        gsap.set(frame, { opacity: 0, y: 24 });
      } else {
        gsap.set(frame, { clipPath: 'inset(0% 0% 100% 0%)' });
        if (img) gsap.set(img, { scale: 1.16 });
      }

      triggers.push(
        ScrollTrigger.create({
          trigger: frame,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            if (cheapMedia) {
              gsap.to(frame, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
              return;
            }
            const tl = gsap.timeline();
            tl.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' });
            // The image settles a beat behind the frame, so the photograph
            // looks like it is coming to rest rather than being pushed there.
            if (img) tl.to(img, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.05);
          },
        })
      );
    });

  return () => triggers.forEach((t) => t.kill());
};
