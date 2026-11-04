import { prefersReducedMotion, qsa, type Teardown } from '../lib/env';

/**
 * The page scrolls natively. No wheel interception, no virtual scroller —
 * the browser's own scrolling is what visitors expect and what their trackpad,
 * mouse wheel, keyboard and screen reader are already tuned for.
 *
 * ScrollTrigger reads the native scroll position on its own, so section
 * animations need no handshake here.
 */

/**
 * Freezes the page behind an open overlay without losing the scroll position.
 *
 * Taking the page's overflow away also takes its scrollbar away, and on any
 * platform that draws a classic one that is 15px of width handed back to the
 * layout in a single frame: the whole page steps sideways, the fixed header
 * with it, and the overlay's own scrollbar appears where the page's used to be.
 * So the width the scrollbar was occupying is measured before it goes and
 * given straight back as padding. See the [data-scroll-locked] block in
 * base.css — the header has to be compensated separately, because a fixed
 * element is laid out against the viewport and never sees html's padding.
 *
 * `scrollbar-gutter: stable` does not solve this on its own: the gutter is a
 * property of a scroll container, and an element with `overflow: hidden` has
 * stopped being one.
 */
export const lockScroll = (locked: boolean) => {
  const html = document.documentElement;

  if (!locked) {
    delete html.dataset.scrollLocked;
    html.style.removeProperty('--scroll-gutter');
    return;
  }

  // Measured before the attribute lands, while the scrollbar is still there.
  html.style.setProperty('--scroll-gutter', `${window.innerWidth - html.clientWidth}px`);
  html.dataset.scrollLocked = 'true';
};

const headerOffset = () => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
  const px = parseFloat(raw);
  return Number.isFinite(px) ? -px : -80;
};

export const initScroll = (): Teardown => {
  const unbind = bindAnchors();

  return () => {
    unbind();
    lockScroll(false);
  };
};

/** In-page links clear the fixed header instead of parking under it. */
const bindAnchors = (): Teardown => {
  const bound: Array<[HTMLAnchorElement, (e: MouseEvent) => void]> = [];

  qsa<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    const onClick = (event: MouseEvent) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;

      event.preventDefault();

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY + headerOffset(),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });

      // Keep the keyboard where the eye went.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    link.addEventListener('click', onClick);
    bound.push([link, onClick]);
  });

  return () => bound.forEach(([el, fn]) => el.removeEventListener('click', fn));
};
