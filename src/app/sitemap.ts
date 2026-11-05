import type { MetadataRoute } from 'next';

import { STATIC_ROUTES, routing, htmlLang, type Locale, type RouteKey } from '@/i18n/routing';
import { urlOf } from '@/lib/seo';
import { allPosts, lastModified, postUrl, translationsOf } from '@/lib/journal';

/**
 * Every route in both languages, each entry listing its translations.
 *
 * lastmod is when the content last changed, never the build time: a sitemap
 * that says every page changed on every deploy teaches Google to ignore it.
 * Bump a date here when that page's copy or prices change.
 */
const UPDATED: Partial<Record<RouteKey, string>> = {
  '/gizlilik': '2026-11-05',
};
const SITE_UPDATED = '2026-11-05';

const PRIORITY: Partial<Record<RouteKey, number>> = {
  '/': 1,
  '/hizmetler': 0.9,
  '/blog': 0.6,
  '/sss': 0.6,
  '/iletisim': 0.7,
  '/emrah-cabkur': 0.7,
  '/gizlilik': 0.2,
};

const alternates = (urls: Partial<Record<Locale, string>>) => ({
  languages: {
    ...Object.fromEntries((Object.entries(urls) as [Locale, string][]).map(([l, u]) => [htmlLang[l], u])),
    ...(urls[routing.defaultLocale] ? { 'x-default': urls[routing.defaultLocale]! } : {}),
  },
});

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = allPosts();
  const newest = posts.map(lastModified).sort().at(-1) ?? SITE_UPDATED;

  const pages = STATIC_ROUTES.flatMap((route) =>
    routing.locales.map((locale) => {
      const p = PRIORITY[route] ?? 0.8;
      return {
        url: urlOf(route, locale),
        lastModified: route === '/blog' ? newest : (UPDATED[route] ?? SITE_UPDATED),
        changeFrequency: route === '/gizlilik' ? ('yearly' as const) : route === '/blog' ? ('weekly' as const) : ('monthly' as const),
        priority: locale === routing.defaultLocale ? p : Math.round((p - 0.2) * 10) / 10,
        alternates: alternates(Object.fromEntries(routing.locales.map((l) => [l, urlOf(route, l)]))),
      };
    }),
  );

  const articles = posts.map((post) => {
    const pairs = translationsOf(post.key);
    return {
      url: postUrl(post.locale, post.slug),
      lastModified: lastModified(post),
      changeFrequency: 'yearly' as const,
      priority: post.locale === routing.defaultLocale ? 0.6 : 0.4,
      alternates: alternates(
        Object.fromEntries((Object.entries(pairs) as [Locale, string][]).map(([l, s]) => [l, postUrl(l, s)])),
      ),
    };
  });

  return [...pages, ...articles];
}
