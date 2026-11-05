import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { Invitation } from '@/components/sections/Invitation';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { Headline } from '@/components/ui/Headline';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/ui/JsonLd';
import { RichText, plain } from '@/components/journal/RichText';
import { SERVICE_PAGES } from '@/lib/service-pages';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import styles from '@/components/service/ServicePage.module.css';
import j from '@/components/journal/Journal.module.css';

type QA = { q: string; a: string };
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'faqPage.meta' });
  return pageMetadata({ locale, route: '/sss', title: t('title'), description: t('description'), image: '/og/sss.jpg' });
}

/**
 * Every question the site answers, on one page: the salon and booking first,
 * then each service's own FAQ with a link to its page. Only the general
 * questions are marked up as FAQPage here; the service questions already carry
 * that markup on their own pages, and one question should have one home.
 */
export default async function FaqPage({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('faqPage');
  const tService = await getTranslations('service');
  const tMeta = await getTranslations('meta');
  const tPages = await getTranslations('pages');
  const onRequest = (await getTranslations('booking'))('onRequest');
  const general = t.raw('items') as QA[];

  const crumbs = [
    { name: tService('home'), route: '/' as const },
    { name: t('breadcrumb'), route: '/sss' as const },
  ];
  const r = (text: string) => <RichText text={text} locale={locale} onRequest={onRequest} linkClass={j.inlineLink} />;

  const List = ({ items, openFirst }: { items: QA[]; openFirst?: boolean }) => (
    <div className={styles.faqList}>
      {items.map((it, i) => (
        <details key={it.q} className={styles.qa} open={openFirst && i === 0}>
          <summary className={styles.q}>
            <h3>{plain(it.q, locale, onRequest)}</h3>
            <span className={styles.qMark} aria-hidden="true" />
          </summary>
          <p className={styles.a}>{r(it.a)}</p>
        </details>
      ))}
    </div>
  );

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

        <section className={`${styles.faq} section--light on-light`} aria-labelledby="faq-general">
          <div className={`shell ${styles.faqGrid}`}>
            <h2 id="faq-general" className="display display--m">
              {t('generalHeading')}
            </h2>
            <List items={general} openFirst />
          </div>
        </section>

        <section className={`${styles.faq} section--light on-light`} aria-labelledby="faq-services">
          <div className="shell">
            <h2 id="faq-services" className={`eyebrow ${styles.relatedTitle}`}>
              {t('servicesHeading')}
            </h2>
          </div>
          {SERVICE_PAGES.map((p) => {
            const copy = tPages.raw(p.key) as { card: { title: string }; faq: { items: QA[] } };
            return (
              <div key={p.key} className={`shell ${styles.faqGrid}`} style={{ marginBottom: 'var(--space-xl)' }}>
                <div className={styles.pricesHead}>
                  <h2 className="display display--s">{copy.card.title}</h2>
                  <Link className="link-arrow" href={p.route}>
                    <span>{t('toService')}</span>
                    <span className="link-arrow__line" aria-hidden="true" />
                  </Link>
                </div>
                <List items={copy.faq.items} />
              </div>
            );
          })}
        </section>

        <Invitation />
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd
        data={[
          faqSchema(general.map((g) => ({ q: g.q, a: plain(g.a, locale, onRequest) }))),
          breadcrumbSchema(crumbs, locale),
        ]}
      />
    </>
  );
}
