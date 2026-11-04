import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { routing } from '@/i18n/routing';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { Hero } from '@/components/sections/Hero';
import { Philosophy } from '@/components/sections/Philosophy';
import { Services } from '@/components/sections/Services';
import { Work } from '@/components/sections/Work';
import { Atelier } from '@/components/sections/Atelier';
import { Testimonials } from '@/components/sections/Testimonials';
import { Reels } from '@/components/sections/Reels';
import { Invitation } from '@/components/sections/Invitation';
import { SiteFooter } from '@/components/sections/SiteFooter';

/**
 * Panfili's running order, with one section added: Work, between the
 * disciplines and the founder, because for a colourist the work is the
 * argument. Every section is a server component; the nav, the booking
 * panel and MotionRoot are the only client islands.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('meta');

  return (
    <>
      <a className="skip-link" href="#main">
        {t('skipToContent')}
      </a>

      <SiteNav />

      <main id="main">
        <Hero locale={locale} />
        <Philosophy />
        <Services />
        <Work />
        <Atelier />
        <Testimonials />
        <Reels />
        <Invitation />
      </main>

      <SiteFooter />
      <BookingPanel />
      <MotionRoot />
    </>
  );
}
