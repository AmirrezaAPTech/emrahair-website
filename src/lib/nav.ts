import type { RouteKey } from '@/i18n/routing';
import type { SectionId } from './site';
import type { ServiceGroupKey } from './services';

export type NavItem =
  | { kind: 'route'; route: RouteKey; label: string }
  | { kind: 'section'; id: SectionId; label: string };

/** The bar and the drawer say the same thing. */
export const HEADER_NAV: readonly NavItem[] = [
  { kind: 'route', route: '/hizmetler', label: 'services' },
  { kind: 'section', id: 'work', label: 'work' },
  { kind: 'section', id: 'atelier', label: 'atelier' },
  { kind: 'section', id: 'reviews', label: 'reviews' },
  { kind: 'section', id: 'contact', label: 'contact' },
];

/** The drawer's index: every price-list group, straight to its anchor. */
export const MENU_GROUPS: readonly ServiceGroupKey[] = ['color', 'cut', 'care', 'nails', 'brows', 'wax'];
