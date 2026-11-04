import { defineRouting } from 'next-intl/routing';

/**
 * Turkish owns the bare paths (emrahair.com/ is Turkish); English is /en.
 * Bahçeşehir has a large expat and international-school community, which is
 * what the English version is for.
 */
export const locales = ['tr', 'en'] as const;

export type Locale = (typeof locales)[number];

export const pathnames = {
  '/': '/',
  '/hizmetler': {
    tr: '/hizmetler-ve-fiyatlar',
    en: '/services-and-prices',
  },
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

export const htmlLang: Record<Locale, string> = { tr: 'tr-TR', en: 'en' };
export const localeShort: Record<Locale, string> = { tr: 'TR', en: 'EN' };
export const localeLabel: Record<Locale, string> = { tr: 'Türkçe', en: 'English' };
