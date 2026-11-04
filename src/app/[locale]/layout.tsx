import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Bodoni_Moda, Hanken_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, htmlLang, type Locale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { site, contact, hours, ratings, founder } from '@/lib/site';
import '@/styles/tokens.css';
import '@/styles/base.css';

/* Bodoni Moda stands in for Panfili's Didot: the same high-contrast modern
   serif, open-licensed, with every Turkish letter (ş ğ ı İ). Hanken Grotesk
   carries everything else, as on Panfili. Both self-hosted by next/font. */
const display = Bodoni_Moda({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
  variable: '--font-bodoni',
  display: 'swap',
});

const sans = Hanken_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-hanken',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(site.url),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: getPathname({ href: '/', locale }),
      languages: Object.fromEntries(routing.locales.map((l) => [htmlLang[l], getPathname({ href: '/', locale: l })])),
    },
    openGraph: {
      type: 'website',
      siteName: site.legalName,
      title: t('title'),
      description: t('description'),
      locale: htmlLang[locale].replace('-', '_'),
      images: [{ url: '/og-emrahair.jpg', width: 1200, height: 630, alt: t('description') }],
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/favicon.svg' },
    other: { 'theme-color': '#17181b' },
  };
}

const DAY: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  /* Only what the client islands read: nav, booking panel, price list. */
  const all = (await import(`@/i18n/messages/${locale}.json`)).default as Record<string, unknown>;
  const clientMessages = Object.fromEntries(['nav', 'hours', 'booking', 'menu'].map((ns) => [ns, all[ns]]));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${site.url}/#salon`,
    name: site.legalName,
    description: t('description'),
    url: site.url,
    telephone: '+902129091569',
    priceRange: '₺₺₺',
    image: `${site.url}/og-emrahair.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${contact.district} ${contact.street}`,
      postalCode: contact.postal,
      addressLocality: 'Başakşehir',
      addressRegion: 'İstanbul',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: contact.geo.lat, longitude: contact.geo.lng },
    sameAs: [contact.instagram, ratings.kolayRandevu.url],
    founder: { '@type': 'Person', name: founder.name, jobTitle: founder.title },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratings.kolayRandevu.score,
      ratingCount: ratings.kolayRandevu.count,
      bestRating: 5,
    },
    openingHoursSpecification: hours
      .filter((h) => h.open)
      .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY[h.day], opens: h.open, closes: h.close })),
    availableLanguage: routing.locales.map((l) => htmlLang[l]),
  };

  return (
    <html lang={htmlLang[locale as Locale]} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body>
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
