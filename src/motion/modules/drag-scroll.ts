import { qsa, type Teardown } from '../lib/env';

/**
 * Push a horizontal rail by grabbing what is in it.
 *
 * Touch already does this, natively and better than any script: a finger on a
 * card scrolls the row, with the platform's own momentum and rubber-banding.
 * The input that cannot is a mouse. A wheel over an `overflow-x` container
 * scrolls the page vertically instead, and there is nothing to drag — so on a
 * narrow desktop window the only way through the row was its scrollbar, which
 * is not a thing anyone should have to aim at.
 *
 * So this binds mouse and pen only, and leaves touch to the platform.
 *
 * Applies to any `[data-drag-scroll]` element, and does nothing at widths where
 * that element has stopped overflowing — the check is per gesture rather than
 * per page, because the rail stops being a rail at 1101px and the window can
 * cross that line without a reload.
 */

/** Below this a gesture is a click that moved slightly, not a drag. */
const THRESHOLD = 4;

export const initDragScroll = (): Teardown => {
  const rails = qsa('[data-drag-scroll]');
  if (!rails.length) return () => {};

  const cleanups: Teardown[] = [];

  rails.forEach((rail) => {
    let pointerId = -1;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let suppressClick = false;

    const overflows = () => rail.scrollWidth - rail.clientWidth > 1;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0 || !overflows()) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      dragging = false;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;

      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < THRESHOLD) return;
        dragging = true;
        rail.dataset.dragging = 'true';
        /* Capture keeps the gesture on the rail when the cursor leaves it
           mid-drag. It throws if the pointer is no longer active, and a throw
           here would take the rest of this handler — the actual scrolling —
           down with it, so the drag works with or without it. */
        try {
          rail.setPointerCapture(pointerId);
        } catch {
          /* not capturable; the drag still tracks while the pointer is over
             the rail, and pointercancel ends it cleanly if it leaves. */
        }
        /* Mandatory snapping and a scrollLeft written on every pointermove are
           two things steering the same value: the snap drags the row back to
           the nearest card mid-gesture and the card sticks to the cursor. The
           rail is handed back to CSS on release, and the snap it then performs
           is what lands the row on a card. */
        rail.style.scrollSnapType = 'none';
      }

      // Suppresses text selection and the browser's own image-drag.
      e.preventDefault();
      rail.scrollLeft = startScroll - dx;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = -1;
      if (!dragging) return;

      dragging = false;
      suppressClick = true;
      delete rail.dataset.dragging;
      try {
        if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
      } catch {
        /* already released with the pointer */
      }
      rail.style.scrollSnapType = '';
    };

    /* A drag ends over whichever card the pointer happens to be on, and the
       browser fires a click there. Nothing in this rail is clickable today,
       which is exactly why it is worth stopping now rather than the first time
       something is. */
    const onClick = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    rail.addEventListener('pointerup', onUp);
    rail.addEventListener('pointercancel', onUp);
    rail.addEventListener('click', onClick, true);

    cleanups.push(() => {
      rail.removeEventListener('pointerdown', onDown);
      rail.removeEventListener('pointermove', onMove);
      rail.removeEventListener('pointerup', onUp);
      rail.removeEventListener('pointercancel', onUp);
      rail.removeEventListener('click', onClick, true);
      delete rail.dataset.dragging;
      rail.style.scrollSnapType = '';
    });
  });

  return () => cleanups.forEach((fn) => fn());
};
