import type { Metadata } from 'next';
import Image from 'next/image';
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
import { servicePage, type ServicePageKey } from '@/lib/service-pages';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, personSchema } from '@/lib/schema';
import ritual from '@/assets/images/ritual.jpg';
import styles from '@/components/service/ServicePage.module.css';

type Copy = {
  meta: { title: string; description: string };
  breadcrumb: string;
  eyebrow: string;
  titleLines: string[];
  titleAccent: string;
  lede: string;
  imageAlt: string;
  sections: { heading: string; body: string[] }[];
  cta: string;
};

type Params = { params: Promise<{ locale: string }> };

/** The services Emrah Çabkur performs himself, linked from his page. */
const HIS: ServicePageKey[] = ['balyaj', 'sac-boyama', 'sac-kesimi', 'keratin', 'gelin-saci'];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages' });
  const c = t.raw('emrah-cabkur') as Copy;
  return pageMetadata({ locale, route: '/emrah-cabkur', title: c.meta.title, description: c.meta.description });
}

export default async function FounderPage({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tPages = await getTranslations('pages');
  const c = tPages.raw('emrah-cabkur') as Copy;
  const t = await getTranslations('service');
  const tMeta = await getTranslations('meta');
  const tNav = await getTranslations('nav');

  const crumbs = [
    { name: t('home'), route: '/' as const },
    { name: c.breadcrumb, route: '/emrah-cabkur' as const },
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        {tMeta('skipToContent')}
      </a>
      <SiteNav />

      <main id="main">
        <section className={`${styles.mast} section--dark on-dark grain`} data-hero>
          <div className={`shell ${styles.mastGrid}`}>
            <div className={styles.mastText}>
              <Breadcrumb items={crumbs} label={t('breadcrumbLabel')} />
              <span className="eyebrow">{c.eyebrow}</span>
              <Headline as="h1" size="xl" lines={c.titleLines.map((l) => `${l.trimEnd()} `)} accent={c.titleAccent} />
              <p className={styles.lede} data-hero-cta>
                {c.lede}
              </p>
              <div className={styles.actions} data-hero-cta>
                <button className="btn" type="button" data-book-open data-book-service="383324-1">
                  {c.cta}
                </button>
              </div>
            </div>
            <figure className={`media ${styles.mastMedia}`} data-hero-cta>
              <Image
                src={ritual}
                alt={c.imageAlt}
                fill
                sizes="(max-width: 899px) 100vw, 40vw"
                quality={76}
                priority
                style={{ objectFit: 'cover' }}
              />
            </figure>
          </div>
        </section>

        <section className={`${styles.body} section--light on-light`}>
          <div className={`shell ${styles.bodyGrid}`}>
            <div className={styles.article}>
              {c.sections.map((s) => (
                <section key={s.heading} className={styles.block}>
                  <h2 className={`display display--m ${styles.blockTitle}`} data-reveal>
                    {s.heading}
                  </h2>
                  {s.body.map((p, i) => (
                    <p key={i} className={styles.para} data-reveal>
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <aside className={styles.aside} aria-label={tNav('services')}>
              <span className="eyebrow eyebrow--muted">{tNav('services')}</span>
              <ul className={styles.facts}>
                {HIS.map((k) => (
                  <li key={k}>
                    <Link className="link-arrow" href={servicePage(k).route}>
                      <span>{(tPages.raw(`${k}.card`) as { title: string }).title}</span>
                      <span className="link-arrow__line" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <button className={`btn ${styles.asideBtn}`} type="button" data-book-open data-book-service="383324-1">
                {c.cta}
              </button>
            </aside>
          </div>
        </section>

        <Invitation />
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd data={[personSchema(locale, c.meta.description), breadcrumbSchema(crumbs, locale)]} />
    </>
  );
}
