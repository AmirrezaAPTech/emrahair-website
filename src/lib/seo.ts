import type { Metadata } from 'next';

import { routing, htmlLang, ogLocale, type Locale, type RouteKey } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { site } from './site';

/** The absolute URL of a route in a locale: what canonical, hreflang, sitemap and JSON-LD all use. */
export const urlOf = (route: RouteKey, locale: Locale) => {
  const path = getPathname({ href: route, locale });
  return `${site.url}${path === '/' ? '' : path}` || site.url;
};

/**
 * Every page's metadata, built one way: a self-referencing canonical, an
 * hreflang pair plus x-default (Turkish, the salon's language), and Open
 * Graph that repeats the title and description rather than inventing new ones.
 */
export function pageMetadata({
  locale,
  route,
  title,
  description,
  image = '/og-emrahair.jpg',
}: {
  locale: Locale;
  route: RouteKey;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const url = urlOf(route, locale);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], urlOf(route, l)])),
        'x-default': urlOf(route, routing.defaultLocale),
      },
    },
    openGraph: {
      type: 'website',
      siteName: site.legalName,
      url,
      title,
      description,
      locale: ogLocale[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
