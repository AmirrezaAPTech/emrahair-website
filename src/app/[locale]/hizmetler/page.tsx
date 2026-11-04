import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { routing, htmlLang } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
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
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: getPathname({ href: '/hizmetler', locale }),
      languages: Object.fromEntries(routing.locales.map((l) => [htmlLang[l], getPathname({ href: '/hizmetler', locale: l })])),
    },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('menu');
  const tMeta = await getTranslations('meta');

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
                  {ratings.kolayRandevu.score.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB')}
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
    </>
  );
}
