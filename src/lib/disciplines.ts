import { serviceById, type ServiceGroupKey } from './services';

/**
 * The five cards on the landing page. Each names the services it advertises,
 * and its "from" price is the lowest of exactly those — so "Kesim & Fön" does
 * not say "from 100 ₺" on the strength of a hair wash nobody books alone.
 *
 * `group` is where the card's link lands on the services page.
 * `clip` has a film under public/videos/services/{key}.mp4.
 */
export const DISCIPLINES = [
  {
    key: 'color',
    group: 'color',
    clip: true,
    services: ['383324-1', '243987-1', '191804-1', '219-1', '345954-1', '29-1', '26-1', '575809-1', '372904-1', '376225-1', '250659-1'],
  },
  {
    key: 'cut',
    group: 'cut',
    clip: true,
    services: ['24-1', '22-1', '221-1', '45-1', '23-1'],
  },
  {
    key: 'care',
    group: 'care',
    clip: true,
    services: ['301244-1', '301248-1', '169-1', '32-1', '329139-1', '474011-1', '237974-1'],
  },
  {
    key: 'bridal',
    group: 'cut',
    clip: true,
    services: ['28-1', '232-1', '25-1', '752-1', '345953-1'],
  },
  {
    key: 'beauty',
    group: 'nails',
    clip: false,
    services: ['33-1', '34-1', '67-1', '68-1', '35-1', '175-1', '40-1', '41-1'],
  },
] as const satisfies readonly {
  key: string;
  group: ServiceGroupKey;
  clip: boolean;
  services: readonly string[];
}[];

export const disciplineFrom = (ids: readonly string[]) =>
  Math.min(...ids.flatMap((id) => (serviceById.get(id)?.price ? [serviceById.get(id)!.price!.min] : [])));
