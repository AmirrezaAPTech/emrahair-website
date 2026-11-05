import { defineRouting } from 'next-intl/routing';

/**
 * Turkish owns the bare paths; English is /en. Turkish is the SEO priority.
 *
 * Every route is keyed by an internal name; the slug per locale carries the
 * keyword and the place, because a landing page only ranks in the language
 * (and for the place) its URL and copy are written for. Slugs are ASCII:
 * Turkish searchers type both "saç" and "sac", and Google folds them, but a
 * diacritic in a URL is percent-encoded everywhere it is shared.
 *
 * The app/[locale]/ folder is named after the KEY. Internal links pass the key
 * (<Link href="/balyaj">), never a slug — a hard-coded slug breaks the
 * language switch on that page.
 */
export const locales = ['tr', 'en'] as const;

export type Locale = (typeof locales)[number];

export const pathnames = {
  '/': '/',
  '/hizmetler': { tr: '/hizmetler-ve-fiyatlar', en: '/services-and-prices' },
  '/balyaj': { tr: '/balyaj-bahcesehir', en: '/balayage-bahcesehir' },
  '/sac-boyama': { tr: '/sac-boyama-bahcesehir', en: '/hair-color-bahcesehir' },
  '/sac-kesimi': { tr: '/sac-kesimi-bahcesehir', en: '/haircut-bahcesehir' },
  '/keratin': { tr: '/keratin-bakim-bahcesehir', en: '/keratin-treatment-bahcesehir' },
  '/gelin-saci': { tr: '/gelin-saci-bahcesehir', en: '/bridal-hair-bahcesehir' },
  '/manikur-pedikur': { tr: '/manikur-pedikur-bahcesehir', en: '/manicure-pedicure-bahcesehir' },
  '/kas-agda': { tr: '/kas-agda-bahcesehir', en: '/brows-waxing-bahcesehir' },
  /* A person's name: the same slug in both languages. */
  '/emrah-cabkur': '/emrah-cabkur',
  '/iletisim': { tr: '/iletisim', en: '/contact' },
} as const;

export type RouteKey = keyof typeof pathnames;

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
  /* Off on purpose: a Turkish salon's address is Turkish for everyone. Many
     Turkish phones run an English UI, and detection would send them to /en. */
  localeDetection: false,
  pathnames,
});

export const htmlLang: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US' };
export const ogLocale: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US' };
export const localeShort: Record<Locale, string> = { tr: 'TR', en: 'EN' };
export const localeLabel: Record<Locale, string> = { tr: 'Türkçe', en: 'English' };
