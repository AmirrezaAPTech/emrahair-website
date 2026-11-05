import type { RouteKey } from '@/i18n/routing';
import { serviceById, type ServiceGroupKey } from './services';

/**
 * The seven service landing pages. Copy lives in src/i18n/pages/{tr,en}/<key>.json;
 * this file holds what is the same in both languages: which services the
 * page's price list shows (by Kolay Randevu id, so prices come from the one
 * source in services.ts), its film, and where it hands on to.
 *
 * `onHome` pages are the six cards on the landing page. Kaş & ağda is reached
 * from the nav, the footer, the price list and the manicure page.
 */
export type ServicePageKey =
  | 'balyaj'
  | 'sac-boyama'
  | 'sac-kesimi'
  | 'keratin'
  | 'gelin-saci'
  | 'manikur-pedikur'
  | 'kas-agda';

export type ServicePage = {
  key: ServicePageKey;
  route: RouteKey;
  /** Price-list rows, in order; the first is what the hero's booking button adds. */
  services: string[];
  /** public/videos/services/<clip>.mp4, with a poster in src/assets/images/services/. */
  clip: string | null;
  related: ServicePageKey[];
  /** Listed on the page but left out of its "from" price: add-ons nobody books alone. */
  notFrom?: string[];
  onHome: boolean;
  /** schema.org serviceType, kept in Turkish in both locales (it is the business's own term). */
  serviceType: string;
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    key: 'balyaj',
    route: '/balyaj',
    services: ['383324-1', '243987-1', '191804-1', '219-1', '345954-1'],
    clip: 'color',
    related: ['sac-boyama', 'keratin', 'sac-kesimi'],
    onHome: true,
    serviceType: 'Balyaj',
  },
  {
    key: 'sac-boyama',
    route: '/sac-boyama',
    services: ['26-1', '575809-1', '372904-1', '376225-1', '43-1', '250659-1', '29-1', '27-1'],
    clip: 'dye',
    related: ['balyaj', 'keratin', 'sac-kesimi'],
    onHome: true,
    serviceType: 'Saç boyama',
  },
  {
    key: 'sac-kesimi',
    route: '/sac-kesimi',
    services: ['24-1', '22-1', '221-1', '45-1', '23-1', '258-1'],
    clip: 'cut',
    related: ['balyaj', 'keratin', 'gelin-saci'],
    notFrom: ['258-1'],
    onHome: true,
    serviceType: 'Saç kesimi',
  },
  {
    key: 'keratin',
    route: '/keratin',
    services: ['301244-1', '301248-1', '169-1', '32-1', '329139-1', '474011-1', '237974-1', '30-1', '205-1'],
    clip: 'care',
    related: ['balyaj', 'sac-kesimi', 'sac-boyama'],
    notFrom: ['205-1'],
    onHome: true,
    serviceType: 'Keratin bakım',
  },
  {
    key: 'gelin-saci',
    route: '/gelin-saci',
    services: ['28-1', '232-1', '25-1', '752-1', '345953-1'],
    clip: 'bridal',
    related: ['sac-kesimi', 'manikur-pedikur', 'balyaj'],
    onHome: true,
    serviceType: 'Gelin saçı',
  },
  {
    key: 'manikur-pedikur',
    route: '/manikur-pedikur',
    services: ['33-1', '34-1', '67-1', '68-1', '69-1', '66-1'],
    clip: 'beauty',
    related: ['kas-agda', 'gelin-saci', 'sac-kesimi'],
    notFrom: ['66-1', '69-1'],
    onHome: true,
    serviceType: 'Manikür ve pedikür',
  },
  {
    key: 'kas-agda',
    route: '/kas-agda',
    services: ['35-1', '175-1', '38-1', '40-1', '571323-1', '571322-1', '571325-1', '269814-1', '41-1'],
    clip: null,
    related: ['manikur-pedikur', 'gelin-saci', 'keratin'],
    onHome: false,
    serviceType: 'Ağda ve kaş',
  },
];

export const servicePage = (key: ServicePageKey) => SERVICE_PAGES.find((p) => p.key === key)!;

/** The page a price-list group's heading links to. */
export const GROUP_PAGE: Record<ServiceGroupKey, ServicePageKey> = {
  color: 'balyaj',
  cut: 'sac-kesimi',
  care: 'keratin',
  nails: 'manikur-pedikur',
  brows: 'kas-agda',
  wax: 'kas-agda',
};

/** The lowest published price on a page, for the card's "from" line and the Offer's minPrice. */
export const pageFrom = (page: ServicePage) =>
  Math.min(
    ...page.services
      .filter((id) => !page.notFrom?.includes(id))
      .flatMap((id) => (serviceById.get(id)?.price ? [serviceById.get(id)!.price!.min] : [])),
  );

// Fail the build, not the page, if an id drifts away from the catalogue.
for (const p of SERVICE_PAGES) for (const id of p.services) if (!serviceById.has(id)) throw new Error(`service-pages: unknown service id ${id} on ${p.key}`);
