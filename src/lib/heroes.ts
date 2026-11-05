import type { StaticImageData } from 'next/image';

import work01 from '@/assets/images/work/01-A.jpg';
import work03 from '@/assets/images/work/03-A.jpg';
import work04 from '@/assets/images/work/04-B.jpg';
import work06 from '@/assets/images/work/06-C.jpg';
import work08 from '@/assets/images/work/08-E.jpg';
import ritual from '@/assets/images/ritual.jpg';
import stations from '@/assets/images/salon/stations.jpg';
import bridal from '@/assets/images/services/bridal.jpg';
import care from '@/assets/images/services/care.jpg';

/**
 * Journal hero images by key. Static imports, so every hero has its real
 * width and height (for Open Graph and the layout) and is served as AVIF.
 * The salon's own photographs first; the two stills from stock clips only
 * where the salon has no photo of that service.
 */
export const HEROES: Record<string, StaticImageData> = {
  'work-01': work01,
  'work-03': work03,
  'work-04': work04,
  'work-06': work06,
  'work-08': work08,
  ritual,
  stations,
  bridal,
  care,
};

/** Which hero each article gets, by article key (shared by both languages). */
export const POST_HERO: Record<string, string> = {
  'ombre-sombre': 'work-01',
  'kullu-kumral': 'work-06',
  'keratin-botoks': 'work-08',
  'amonyaksiz-boya': 'ritual',
  'fiyatlar-2026': 'stations',
  'gelin-basi': 'bridal',
};
