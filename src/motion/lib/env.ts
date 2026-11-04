/** Shared environment reads. One source, so modules cannot disagree. */

const query = (q: string) =>
  typeof window === 'undefined' ? { matches: false } as MediaQueryList : window.matchMedia(q);

export const prefersReducedMotion = () =>
  query('(prefers-reduced-motion: reduce)').matches;

/** A device whose only pointer is a finger. Effects that are per-frame work
    with little payoff on a small screen are gated behind this. */
export const isTouchDevice = () =>
  query('(hover: none) and (pointer: coarse)').matches;

/** A cursor that can hover and point precisely, on a canvas big enough to matter. */
export const isFinePointer = () =>
  query('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 1024;

export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);

export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/** Frame-rate independent interpolation: stable at 60Hz and at 144Hz alike. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Every module returns one of these so the React root can tear it down. */
export type Teardown = () => void;

export const noop: Teardown = () => {};
