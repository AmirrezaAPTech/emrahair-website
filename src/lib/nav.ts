import type { RouteKey } from '@/i18n/routing';
import type { SectionId } from './site';
import { SERVICE_PAGES, type ServicePageKey } from './service-pages';

export type NavItem =
  | { kind: 'route'; route: RouteKey; label: string }
  | { kind: 'section'; id: SectionId; label: string };

/** The bar and the drawer say the same thing. Pages where a page exists, anchors for the rest. */
export const HEADER_NAV: readonly NavItem[] = [
  { kind: 'route', route: '/hizmetler', label: 'prices' },
  { kind: 'section', id: 'work', label: 'work' },
  { kind: 'route', route: '/emrah-cabkur', label: 'atelier' },
  { kind: 'section', id: 'reviews', label: 'reviews' },
  { kind: 'route', route: '/iletisim', label: 'contact' },
];

/** The drawer's index and the footer's services column: every service page. */
export const MENU_PAGES: readonly { key: ServicePageKey; route: RouteKey }[] = SERVICE_PAGES.map((p) => ({
  key: p.key,
  route: p.route,
}));
