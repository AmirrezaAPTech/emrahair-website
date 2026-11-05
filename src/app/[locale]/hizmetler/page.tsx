import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/ui/JsonLd';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { PriceMenu } from '@/components/sections/PriceMenu';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { Headline } from '@/components/ui/Headline';
import { ALL_SERVICES } from '@/lib/services';
import { ratings } from '@/lib/site';
import styles from './page.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'menu.meta' });
  return pageMetadata({ locale, route: '/hizmetler', title: t('title'), description: t('description'), image: '/og/hizmetler.jpg' });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('menu');
  const tMeta = await getTranslations('meta');
  const tService = await getTranslations('service');
  const tNav = await getTranslations('nav');

  return (
    <>
      <a className="skip-link" href="#main">
        {tMeta('skipToContent')}
      </a>
      <SiteNav />

      <main id="main">
        <section className={`${styles.mast} section--dark on-dark grain`} data-hero>
          <div className={`shell ${styles.mastInner}`}>
            <span className="eyebrow" data-hero-eyebrow>
              {t('eyebrow')}
            </span>
            <Headline as="h1" size="xl" lines={t.raw('titleLines') as string[]} accent={t('titleAccent')} />
            <p className={styles.lede} data-hero-cta>
              {t('lede')}
            </p>
            <ul className={styles.facts} data-hero-cta>
              <li>
                <span className={styles.factValue}>{ALL_SERVICES.length}</span>
                <span className={styles.factLabel}>{t('facts.services')}</span>
              </li>
              <li>
                <span className={styles.factValue}>
                  {ratings.kolayRandevu.score.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
                <span className={styles.factLabel}>{t('facts.rating', { count: ratings.kolayRandevu.count })}</span>
              </li>
              <li>
                <span className={styles.factValue}>{t('facts.howValue')}</span>
                <span className={styles.factLabel}>{t('facts.how')}</span>
              </li>
            </ul>
          </div>
        </section>

        <section className={`${styles.menu} section--light on-light`} aria-label={t('label')}>
          <div className="shell">
            <PriceMenu />
          </div>
        </section>
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd data={breadcrumbSchema([{ name: tService('home'), route: '/' }, { name: tNav('services'), route: '/hizmetler' }], locale)} />
    </>
  );
}
