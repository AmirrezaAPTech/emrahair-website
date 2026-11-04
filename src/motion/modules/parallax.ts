import { gsap, ScrollTrigger } from '../lib/gsap';
import { isTouchDevice, prefersReducedMotion, qsa, type Teardown } from '../lib/env';

/**
 * Depth, kept quiet.
 *
 * Vertical drift is a fraction of the element's own height, so a letterboxed
 * band and a full-bleed plate move by the same proportion rather than the same
 * number of pixels. Horizontal drift is reserved for the gallery rail, where
 * alternating directions make a flat row of photographs feel like a space.
 */
export const initParallax = (): Teardown => {
  /* Skipped on touch. Every drift here is a scrubbed tween evaluated per
     scroll frame, there are a few dozen of them on the landing page, and on a
     phone the depth they buy is a couple of millimetres nobody registers.
     Scroll smoothness is worth more than the effect. */
  if (prefersReducedMotion() || isTouchDevice()) return () => {};

  const triggers: ScrollTrigger[] = [];

  qsa<HTMLElement>('[data-parallax-y]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallaxY ?? '0.12');
    const tween = gsap.fromTo(
      el,
      { yPercent: -amount * 50 },
      {
        yPercent: amount * 50,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('figure, section, div') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  qsa<HTMLElement>('[data-parallax-x]').forEach((el) => {
    const dir = parseFloat(el.dataset.parallaxX ?? '1');
    const img = el.querySelector('img');
    if (!img) return;

    const tween = gsap.fromTo(
      img,
      { xPercent: -1.8 * dir },
      {
        xPercent: 1.8 * dir,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  // Layout settles after fonts and lazy images land; stale trigger positions
  // are the usual cause of parallax that drifts out of register.
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });

  return () => {
    triggers.forEach((t) => t.kill());
    window.removeEventListener('load', refresh);
  };
};
