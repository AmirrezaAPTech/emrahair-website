import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Bodoni_Moda, Hanken_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, htmlLang, type Locale } from '@/i18n/routing';
import { site } from '@/lib/site';
import { salonSchema } from '@/lib/schema';
import { JsonLd } from '@/components/ui/JsonLd';
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

/* Site-wide only. Each page sets its own title, description, canonical and
   hreflang through lib/seo.ts, so no page can inherit the home page's. */
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(site.url),
    icons: { icon: '/favicon.svg' },
    other: { 'theme-color': '#17181b' },
    formatDetection: { telephone: false },
  };
}

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

  const schema = salonSchema(locale as Locale, t('description'));

  return (
    <html lang={htmlLang[locale as Locale]} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd data={schema} />
      </head>
      <body>
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
