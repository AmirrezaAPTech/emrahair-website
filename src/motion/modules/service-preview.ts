import { gsap } from '../lib/gsap';
import { damp, isFinePointer, prefersReducedMotion, qs, qsa, type Teardown } from '../lib/env';

/**
 * The service index preview.
 *
 * A photograph of the actual room trails the cursor while a row is hovered,
 * carrying that service's description with it. It lags the pointer noticeably:
 * chasing it exactly feels cheap, a heavy follow reads as weight.
 *
 * Pointer-fine devices only. On touch the photograph and the description are
 * already inside the row.
 */
export const initServicePreview = (): Teardown => {
  const preview = qs('[data-svc-preview]');
  const rows = qsa('[data-svc-row]');
  if (!preview || !rows.length) return () => {};
  if (!isFinePointer() || prefersReducedMotion()) return () => {};

  const items = qsa('[data-svc-preview-item]', preview);
  const setX = gsap.quickSetter(preview, 'x', 'px');
  const setY = gsap.quickSetter(preview, 'y', 'px');

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let active = -1;
  let raf = 0;
  let last = performance.now();

  const track = (e: PointerEvent) => {
    const rect = preview.getBoundingClientRect();
    targetX = e.clientX - rect.width / 2;
    targetY = e.clientY - rect.height / 2;
  };

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    // Two speeds: the frame catches up faster horizontally than vertically,
    // which gives the drag a slight sideways sweep as you move down the list.
    x = damp(x, targetX, 9, dt);
    y = damp(y, targetY, 7, dt);
    setX(x);
    setY(y);
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const show = (index: number) => {
    if (index === active) return;
    const previous = active;
    active = index;

    gsap.to(preview, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    const prevItem = items[previous];
    if (previous > -1 && prevItem) {
      gsap.to(prevItem, { opacity: 0, duration: 0.35, ease: 'power2.in' });
    }

    const next = items[index];
    if (!next) return;

    gsap.killTweensOf(next);
    // The frame opens as a horizontal slit and widens. Reads like a shutter
    // rather than a tooltip.
    gsap.fromTo(
      next,
      { opacity: 0, clipPath: 'inset(46% 0% 46% 0%)' },
      { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.out' }
    );
    const img = next.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.24 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
  };

  const hide = () => {
    if (active === -1) return;
    gsap.to(preview, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    const item = items[active];
    if (item) gsap.to(item, { opacity: 0, duration: 0.4 });
    active = -1;
    stop();
  };

  const cleanups: Teardown[] = [];

  rows.forEach((row, i) => {
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      track(e);
      // Land the frame where the cursor already is instead of flying it in.
      x = targetX;
      y = targetY;
      setX(x);
      setY(y);
      start();
      show(i);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hide();
    };
    row.addEventListener('pointerenter', onEnter);
    row.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      row.removeEventListener('pointerenter', onEnter);
      row.removeEventListener('pointerleave', onLeave);
    });
  });

  const list = qs('[data-svc-list]');
  const onMove = (e: Event) => {
    const pe = e as PointerEvent;
    if (pe.pointerType === 'mouse') track(pe);
  };
  list?.addEventListener('pointermove', onMove);

  // A row can lose the pointer without a leave event when the page scrolls
  // under a still cursor, or when the tab loses focus mid-hover.
  window.addEventListener('blur', hide);

  return () => {
    cleanups.forEach((fn) => fn());
    list?.removeEventListener('pointermove', onMove);
    window.removeEventListener('blur', hide);
    stop();
  };
};
