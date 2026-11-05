import { routing, htmlLang, type Locale, type RouteKey } from '@/i18n/routing';
import { site, contact, hours, founder, ratings } from './site';
import { serviceById } from './services';
import { urlOf } from './seo';

/**
 * Structured data. One HairSalon, declared once in the layout under a stable
 * @id; every other block points at it rather than repeating the address, so
 * Google reads one business, not nine.
 *
 * No aggregateRating: Google treats ratings a business publishes about itself
 * on its own site as self-serving and shows no stars for them. The ratings are
 * on the page as text, with their sources; the stars come from the Business
 * Profile.
 */
export const SALON_ID = `${site.url}/#salon`;
export const FOUNDER_ID = `${site.url}/emrah-cabkur#person`;

const DAY: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

const address = {
  '@type': 'PostalAddress',
  streetAddress: `${contact.district} ${contact.street}`,
  postalCode: contact.postal,
  addressLocality: 'Başakşehir',
  addressRegion: 'İstanbul',
  addressCountry: 'TR',
};

const areaServed = ['Bahçeşehir', 'Başakşehir', 'Esenyurt', 'İstanbul'].map((name) => ({ '@type': 'Place', name }));

export function salonSchema(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['HairSalon', 'BeautySalon'],
    '@id': SALON_ID,
    name: site.legalName,
    alternateName: 'Emrahair Bahçeşehir Kuaför',
    description,
    url: urlOf('/', locale),
    telephone: '+902129091569',
    image: `${site.url}/og-emrahair.jpg`,
    logo: `${site.url}/favicon.svg`,
    priceRange: '₺₺₺',
    currenciesAccepted: 'TRY',
    address,
    geo: { '@type': 'GeoCoordinates', latitude: contact.geo.lat, longitude: contact.geo.lng },
    hasMap: contact.mapsUrl,
    areaServed,
    sameAs: [contact.instagram, ratings.kolayRandevu.url, contact.mapsUrl],
    founder: { '@id': FOUNDER_ID },
    openingHoursSpecification: hours
      .filter((h) => h.open)
      .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY[h.day], opens: h.open, closes: h.close })),
    availableLanguage: routing.locales.map((l) => htmlLang[l]),
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: ratings.kolayRandevu.url, actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'] },
      result: { '@type': 'Reservation', name: locale === 'tr' ? 'Randevu' : 'Appointment' },
    },
  };
}

export function breadcrumbSchema(items: { name: string; route: RouteKey }[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: urlOf(it.route, locale) })),
  };
}

export function serviceSchema({
  name,
  description,
  route,
  locale,
  serviceType,
  serviceIds,
}: {
  name: string;
  description: string;
  route: RouteKey;
  locale: Locale;
  serviceType: string;
  serviceIds: string[];
}) {
  const priced = serviceIds.map((id) => serviceById.get(id)!).filter((s) => s.price);
  const lows = priced.map((s) => s.price!.min);
  const highs = priced.map((s) => s.price!.max ?? s.price!.min);
  const url = urlOf(route, locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    serviceType,
    url,
    provider: { '@id': SALON_ID },
    areaServed,
    availableLanguage: htmlLang[locale],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name,
      itemListElement: serviceIds.map((id) => {
        const s = serviceById.get(id)!;
        return {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: locale === 'tr' ? s.tr : s.en },
          ...(s.price
            ? {
                priceCurrency: 'TRY',
                priceSpecification: {
                  '@type': 'PriceSpecification',
                  priceCurrency: 'TRY',
                  minPrice: s.price.min,
                  ...(s.price.max ? { maxPrice: s.price.max } : { price: s.price.min }),
                },
              }
            : {}),
        };
      }),
    },
    ...(lows.length
      ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'TRY', lowPrice: Math.min(...lows), highPrice: Math.max(...highs), offerCount: priced.length } }
      : {}),
  };
}

/** Must match the FAQ visible on the page word for word, or it is spam to Google. */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

export function personSchema(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: founder.name,
    jobTitle: locale === 'tr' ? 'Kuaför, renk uzmanı' : 'Hairdresser and colorist',
    description,
    url: urlOf('/emrah-cabkur', locale),
    image: `${site.url}/og-emrahair.jpg`,
    worksFor: { '@id': SALON_ID },
    affiliation: { '@type': 'Organization', name: 'Echosline', description: founder.title },
    knowsAbout: ['Air Touch balyaj', 'Balyaj', 'Saç boyama', 'Saç kesimi', 'Keratin bakım', 'Gelin saçı'],
    sameAs: [contact.instagram],
    workLocation: { '@type': 'Place', name: 'Bahçeşehir, Başakşehir, İstanbul', address },
  };
}

export function contactPageSchema(locale: Locale, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name,
    description,
    url: urlOf('/iletisim', locale),
    about: { '@id': SALON_ID },
    inLanguage: htmlLang[locale],
  };
}

export function webPageSchema(locale: Locale, route: RouteKey, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: urlOf(route, locale),
    inLanguage: htmlLang[locale],
    isPartOf: { '@type': 'WebSite', name: site.legalName, url: urlOf('/', locale) },
    about: { '@id': SALON_ID },
  };
}
