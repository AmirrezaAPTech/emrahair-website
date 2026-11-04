import { gsap, ScrollTrigger } from '../lib/gsap';
import { isTouchDevice, prefersReducedMotion, qs, qsa, type Teardown } from '../lib/env';

/**
 * The opening sequence. It runs once, after the cover lifts, and it is the one
 * place on the site where motion is allowed to be the point.
 *
 * Order matters: the photograph is already settling before the first line of
 * type arrives, so the page reads as a room you walked into rather than a set
 * of elements being assembled.
 */
export const playHeroIntro = () => {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const lines = qsa('[data-reveal-line] > span', hero);
  const eyebrow = qs('[data-hero-eyebrow]', hero);
  const ctas = qsa('[data-hero-cta]', hero);

  if (prefersReducedMotion()) {
    gsap.set([eyebrow, ...ctas, ...lines].filter(Boolean), { clearProps: 'all' });
    return;
  }

  gsap.set(lines, { yPercent: 126 });
  gsap.set([eyebrow, ...ctas].filter(Boolean), { opacity: 0, y: 18 });

  /* No scale on the media any more.
     This opened by pushing the hero in 10% and easing it back to 1 over 2.4
     seconds. On the still it read as a slow settle; on video it reads as the
     footage lurching, because the clip is already moving — the camera walks
     through the salon — so the two motions compound and the first seconds look
     like a zoom nobody asked for. The type still arrives; the picture no
     longer moves underneath it.

     The parallax on scroll is unaffected: it travels into bleed on the
     element's box rather than into a scale, which is why removing this leaves
     it with somewhere to go. */
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .to([eyebrow].filter(Boolean), { opacity: 1, y: 0, duration: 1 }, 0.15)
    .to(lines, { yPercent: 0, duration: 1.5, stagger: 0.1 }, 0.3)
    .to(ctas, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 1.05);
};

/**
 * On scroll the photograph drifts up more slowly than the page and the type
 * lifts and dims. The hero recedes rather than being pushed off.
 */
export const initHeroScroll = (): Teardown => {
  const hero = qs('[data-hero]');
  /* Touch skips the recede: two more scrubbed tweens per scroll frame, over a
     video that is already moving, on the least powerful screens. */
  if (!hero || prefersReducedMotion() || isTouchDevice()) return () => {};

  const trigger = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    animation: gsap
      .timeline()
      // 3% against a box that bleeds 4% past the hero on each edge. Any more
      // travel than the bleed and the drift walks the photograph's own edge
      // into frame at the bottom of the section.
      .to(qs('[data-hero-media]', hero), { yPercent: 3, ease: 'none' }, 0)
      .to(qs('[data-hero-inner]', hero), { yPercent: -12, opacity: 0.35, ease: 'none' }, 0),
  });

  return () => trigger.kill();
};

/** Pre-hides the hero so the intro has somewhere to come from. */
export const armHeroIntro = () => {
  if (prefersReducedMotion()) return;
  const hero = qs('[data-hero]');
  if (!hero) return;
  gsap.set(qsa('[data-reveal-line] > span', hero), { yPercent: 126 });
  gsap.set([qs('[data-hero-eyebrow]', hero), ...qsa('[data-hero-cta]', hero)].filter(Boolean), { opacity: 0, y: 18 });
};
