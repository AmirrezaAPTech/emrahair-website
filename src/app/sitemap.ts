import type { MetadataRoute } from 'next';

import { pathnames, routing, htmlLang, type RouteKey } from '@/i18n/routing';
import { urlOf } from '@/lib/seo';

/** Every route in both languages, each entry listing its translations (hreflang in the sitemap). */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = Object.keys(pathnames) as RouteKey[];
  const lastModified = new Date();
  const priority = (r: RouteKey) => (r === '/' ? 1 : r === '/hizmetler' ? 0.9 : r === '/iletisim' || r === '/emrah-cabkur' ? 0.7 : 0.8);

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: urlOf(route, locale),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: locale === routing.defaultLocale ? priority(route) : priority(route) - 0.2,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [htmlLang[l], urlOf(route, l)])),
          'x-default': urlOf(route, routing.defaultLocale),
        },
      },
    })),
  );
}
