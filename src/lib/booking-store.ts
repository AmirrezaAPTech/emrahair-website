'use client';

import { useSyncExternalStore } from 'react';

import { serviceById } from './services';

/**
 * The guest's selection, shared by the booking panel and the price list.
 *
 * A module-level store rather than React context, so server components can
 * render the triggers (data-book-open, data-book-service) and only the two
 * client islands subscribe. Kept in sessionStorage so a selection survives
 * moving between the landing page and the price list.
 */

export type StaffChoice = 'emrah' | 'serdar' | 'any';

type State = {
  selected: string[];
  staff: StaffChoice;
};

const KEY = 'emrahair:booking';
const EMPTY: State = { selected: [], staff: 'any' };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<State>;
    state = {
      selected: (parsed.selected ?? []).filter((id) => serviceById.has(id)),
      staff: parsed.staff === 'emrah' || parsed.staff === 'serdar' ? parsed.staff : 'any',
    };
  } catch {
    /* a private window without storage just starts empty */
  }
}

function set(next: State) {
  state = next;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the in-memory state still works */
  }
  listeners.forEach((fn) => fn());
}

export const bookingStore = {
  subscribe(fn: () => void) {
    hydrate();
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get: () => {
    hydrate();
    return state;
  },
  toggle(id: string) {
    const s = bookingStore.get();
    set({ ...s, selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id] });
  },
  add(id: string) {
    const s = bookingStore.get();
    if (!s.selected.includes(id)) set({ ...s, selected: [...s.selected, id] });
  },
  setStaff(staff: StaffChoice) {
    set({ ...bookingStore.get(), staff });
  },
  clear() {
    set({ ...bookingStore.get(), selected: [] });
  },
};

export function useBooking(): State {
  return useSyncExternalStore(bookingStore.subscribe, bookingStore.get, () => EMPTY);
}

/** The estimate: sum of minimums to sum of maximums, over priced services. */
export function estimate(ids: readonly string[]) {
  let min = 0;
  let max = 0;
  let unpriced = 0;
  for (const id of ids) {
    const p = serviceById.get(id)?.price;
    if (!p) {
      unpriced++;
      continue;
    }
    min += p.min;
    max += p.max ?? p.min;
  }
  return { min, max, unpriced };
}

/**
 * Which of Emrah and Serdar can take every selected service. KR only offers a
 * staff dropdown for hair services; nails, brows and waxing are Gizem's, so
 * a selection of only those needs no staff step at all.
 */
export function staffFit(ids: readonly string[]) {
  const services = ids.map((id) => serviceById.get(id)).filter((s) => s !== undefined);
  const hair = services.filter((s) => s.staff.includes('emrah') || s.staff.includes('serdar'));
  return {
    needsChoice: hair.length > 0,
    emrah: hair.filter((s) => !s.staff.includes('emrah')),
    serdar: hair.filter((s) => !s.staff.includes('serdar')),
  };
}
