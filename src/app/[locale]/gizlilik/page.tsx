import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { Headline } from '@/components/ui/Headline';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import styles from '@/components/service/ServicePage.module.css';
import j from '@/components/journal/Journal.module.css';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'privacy.meta' });
  return pageMetadata({ locale, route: '/gizlilik', title: t('title'), description: t('description') });
}

/** What the site does with visitors' data, in plain words. Facts about this site only. */
export default async function PrivacyPage({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('privacy');
  const tService = await getTranslations('service');
  const tMeta = await getTranslations('meta');
  const sections = t.raw('sections') as { heading: string; body: string[] }[];

  const crumbs = [
    { name: tService('home'), route: '/' as const },
    { name: t('breadcrumb'), route: '/gizlilik' as const },
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        {tMeta('skipToContent')}
      </a>
      <SiteNav />

      <main id="main">
        <section className={`${styles.mast} section--dark on-dark grain`} data-hero>
          <div className="shell">
            <div className={styles.mastText}>
              <Breadcrumb items={crumbs} label={tService('breadcrumbLabel')} />
              <span className="eyebrow">{t('eyebrow')}</span>
              <Headline
                as="h1"
                size="xl"
                lines={(t.raw('titleLines') as string[]).map((l) => `${l.trimEnd()} `)}
                accent={t('titleAccent')}
              />
              <p className={styles.lede} data-hero-cta>
                {t('lede')}
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.body} section--light on-light`}>
          <div className="shell">
            <div className={j.prose}>
              {sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="display display--m">{s.heading}</h2>
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </section>
              ))}
              <p className={j.meta}>{t('updated')}</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd
        data={[webPageSchema(locale, '/gizlilik', t('meta.title'), t('meta.description')), breadcrumbSchema(crumbs, locale)]}
      />
    </>
  );
}
