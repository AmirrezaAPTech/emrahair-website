import type { Metadata } from 'next';
import { getImageProps, type StaticImageData } from 'next/image';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { ServicePrices } from '@/components/sections/PriceMenu';
import { Invitation } from '@/components/sections/Invitation';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { Headline } from '@/components/ui/Headline';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/ui/JsonLd';
import { servicePage, pageFrom, type ServicePageKey } from '@/lib/service-pages';
import { serviceById } from '@/lib/services';
import { contact, formatTL, priceLabel, team } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema';
import { postsFor } from '@/lib/journal';
import { PostCard } from '@/components/journal/PostCard';
import j from '@/components/journal/Journal.module.css';

import color from '@/assets/images/services/color.jpg';
import dye from '@/assets/images/services/dye.jpg';
import cut from '@/assets/images/services/cut.jpg';
import care from '@/assets/images/services/care.jpg';
import bridal from '@/assets/images/services/bridal.jpg';
import beauty from '@/assets/images/services/beauty.jpg';
import styles from './ServicePage.module.css';

const POSTERS: Record<string, StaticImageData> = { color, dye, cut, care, bridal, beauty };
/* Same cache-busting rule as the home cards (ServicesGrid): bump on re-encode. */
const CLIP_VERSION = 3;

type Section = { heading: string; body: string[] };
type Copy = {
  meta: { title: string; description: string };
  breadcrumb: string;
  card: { title: string; summary: string };
  eyebrow: string;
  titleLines: string[];
  titleAccent: string;
  lede: string;
  mediaAlt: string;
  sections: Section[];
  prices: { heading: string; intro: string };
  steps: { heading: string; items: { title: string; body: string }[] };
  faq: { heading: string; items: { q: string; a: string }[] };
};

type Params = { params: Promise<{ locale: string }> };

/**
 * Page copy is read raw, not through ICU: the FAQ answers carry price tokens,
 * [[<service id>]], replaced here from services.ts so a price is written in
 * exactly one place and the FAQ can never quote a stale one.
 */
async function load(key: ServicePageKey, locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'pages' });
  const onRequest = (await getTranslations({ locale, namespace: 'booking' }))('onRequest');
  const fill = (s: string) =>
    s.replace(/\[\[([\w-]+)\]\]/g, (_, id: string) => priceLabel(serviceById.get(id)?.price ?? null, locale, onRequest));
  const raw = t.raw(key) as Copy;
  return {
    ...raw,
    faq: { ...raw.faq, items: raw.faq.items.map((it) => ({ q: fill(it.q), a: fill(it.a) })) },
    sections: raw.sections.map((s) => ({ ...s, body: s.body.map(fill) })),
  };
}

/** Headline appends the accent to the last line; a space keeps the words apart in the text Google reads. */
const spaced = (lines: string[]) => lines.map((l) => (/\s$/.test(l) ? l : `${l} `));

export function servicePageRoute(key: ServicePageKey) {
  const page = servicePage(key);

  async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) return {};
    const copy = await load(key, locale);
    return pageMetadata({ locale, route: page.route, title: copy.meta.title, description: copy.meta.description, image: `/og/${key}.jpg` });
  }

  async function Page({ params }: Params) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);

    const copy = await load(key, locale);
    const t = await getTranslations('service');
    const tMeta = await getTranslations('meta');
    const tNav = await getTranslations('nav');
    const tPages = await getTranslations('pages');
    const tSvc = await getTranslations('services');
    const tJournal = await getTranslations('journal');
    const onRequestLabel = (await getTranslations('booking'))('onRequest');
    const articles = postsFor(locale, page.route).slice(0, 3);

    const crumbs = [
      { name: t('home'), route: '/' as const },
      { name: tNav('services'), route: '/hizmetler' as const },
      { name: copy.breadcrumb, route: page.route },
    ];

    const staffKeys = [...new Set(page.services.flatMap((id) => serviceById.get(id)!.staff))];
    const staff = staffKeys.map((k) => team.find((m) => m.key === k)!.name);
    const from = `${formatTL(pageFrom(page), locale)} ₺`;

    const poster = page.clip ? POSTERS[page.clip] : null;
    const posterProps = poster
      ? getImageProps({ alt: '', src: poster, sizes: '(max-width: 899px) 100vw, 40vw', quality: 72 }).props
      : null;

    const related = page.related.map((k) => {
      const p = servicePage(k);
      const card = tPages.raw(`${k}.card`) as Copy['card'];
      return { key: k, route: p.route, ...card, from: `${formatTL(pageFrom(p), locale)} ₺` };
    });

    return (
      <>
        <a className="skip-link" href="#main">
          {tMeta('skipToContent')}
        </a>
        <SiteNav />

        <main id="main">
          {/* --- Mast: what it is, where, and the way to book it ---------- */}
          <section className={`${styles.mast} section--dark on-dark grain`} data-hero>
            <div className={`shell ${styles.mastGrid}`}>
              <div className={styles.mastText}>
                <Breadcrumb items={crumbs} label={t('breadcrumbLabel')} />
                <span className="eyebrow">{copy.eyebrow}</span>
                <Headline as="h1" size="xl" lines={spaced(copy.titleLines)} accent={copy.titleAccent} />
                <p className={styles.lede} data-hero-cta>
                  {copy.lede}
                </p>
                <div className={styles.actions} data-hero-cta>
                  <button className="btn" type="button" data-book-open data-book-service={page.services[0]}>
                    {t('book')}
                  </button>
                  <a className="link-arrow" href="#fiyatlar">
                    <span>{t('seePrices')}</span>
                    <span className="link-arrow__line" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <figure className={`media ${styles.mastMedia}`} data-hero-cta>
                {page.clip && posterProps ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from the copy */}
                    <img {...posterProps} alt={copy.mediaAlt} className={styles.mastPoster} fetchPriority="high" />
                    <video
                      className={styles.mastVideo}
                      data-svc-video
                      src={`/videos/services/${page.clip}.mp4?v=${CLIP_VERSION}#t=0.001`}
                      preload="metadata"
                      muted
                      loop
                      playsInline
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </>
                ) : (
                  <span className={styles.plate} aria-hidden="true">
                    <span className={styles.plateMark}>G</span>
                    <span className={styles.plateName}>Gizem Değişener</span>
                  </span>
                )}
              </figure>
            </div>
          </section>

          {/* --- What it is: the answers people search for --------------- */}
          <section className={`${styles.body} section--light on-light`}>
            <div className={`shell ${styles.bodyGrid}`}>
              <div className={styles.article}>
                {copy.sections.map((s) => (
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

              <aside className={styles.aside} aria-label={copy.card.title}>
                <dl className={styles.facts}>
                  <div>
                    <dt>{t('priceFrom')}</dt>
                    <dd>{from}</dd>
                  </div>
                  <div>
                    <dt>{t('staff')}</dt>
                    <dd>{staff.join(', ')}</dd>
                  </div>
                  <div>
                    <dt>{t('where')}</dt>
                    <dd>
                      <a href={contact.mapsUrl} target="_blank" rel="noreferrer noopener">
                        {contact.district}
                        <br />
                        {contact.street}
                      </a>
                      <br />
                      <a href={contact.phoneHref}>{contact.phone}</a>
                    </dd>
                  </div>
                </dl>
                <button className={`btn ${styles.asideBtn}`} type="button" data-book-open data-book-service={page.services[0]}>
                  {t('book')}
                </button>
                <Link className="link-arrow" href="/emrah-cabkur">
                  <span>{t('founderLink')}</span>
                  <span className="link-arrow__line" aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </section>

          {/* --- Prices: this page's rows of the one price list ----------- */}
          <section className={`${styles.prices} section--light on-light`} id="fiyatlar" aria-labelledby="prices-title">
            <div className={`shell ${styles.pricesGrid}`}>
              <header className={styles.pricesHead}>
                <h2 id="prices-title" className="display display--m" data-reveal>
                  {copy.prices.heading}
                </h2>
                <p className={styles.para} data-reveal>
                  {copy.prices.intro}
                </p>
                <Link className="link-arrow" href="/hizmetler">
                  <span>{t('allPrices')}</span>
                  <span className="link-arrow__line" aria-hidden="true" />
                </Link>
              </header>
              <ServicePrices ids={page.services} />
            </div>
          </section>

          {/* --- How the appointment goes ------------------------------- */}
          <section className={`${styles.steps} section--dark on-dark`} aria-labelledby="steps-title">
            <div className="shell">
              <h2 id="steps-title" className={`display display--l ${styles.stepsTitle}`} data-reveal>
                {copy.steps.heading}
              </h2>
              <ol className={styles.stepList}>
                {copy.steps.items.map((s, i) => (
                  <li key={s.title} className={styles.step} data-reveal>
                    <span className={`numeral ${styles.stepNo}`} aria-label={`${t('stepsLabel')} ${i + 1}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={`display display--s ${styles.stepTitle}`}>{s.title}</h3>
                    <p className={styles.stepBody}>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* --- FAQ: visible, and the same words as the FAQPage block ---- */}
          <section className={`${styles.faq} section--light on-light`} aria-labelledby="faq-title">
            <div className={`shell ${styles.faqGrid}`}>
              <h2 id="faq-title" className="display display--m" data-reveal>
                {copy.faq.heading}
              </h2>
              <div className={styles.faqList}>
                {copy.faq.items.map((it, i) => (
                  <details key={it.q} className={styles.qa} open={i === 0}>
                    <summary className={styles.q}>
                      <h3>{it.q}</h3>
                      <span className={styles.qMark} aria-hidden="true" />
                    </summary>
                    <p className={styles.a}>{it.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* --- Where next ----------------------------------------------- */}
          <section className={`${styles.related} section--light on-light`} aria-labelledby="related-title">
            <div className="shell">
              <h2 id="related-title" className={`eyebrow ${styles.relatedTitle}`}>
                {t('related')}
              </h2>
              <ul className={styles.relatedList}>
                {related.map((r) => (
                  <li key={r.key} className={styles.relatedItem}>
                    <Link className={styles.relatedLink} href={r.route}>
                      <span className={`display display--s ${styles.relatedName}`}>{r.title}</span>
                      <span className={styles.relatedSummary}>{r.summary}</span>
                      <span className={styles.relatedFrom}>{tSvc('from', { price: r.from })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {articles.length > 0 && (
            <section className={`${styles.related} section--light on-light`} aria-labelledby="journal-title">
              <div className="shell">
                <h2 id="journal-title" className={`eyebrow ${styles.relatedTitle}`}>
                  {tJournal('fromJournal')}
                </h2>
                <div className={j.list}>
                  {articles.map((p) => (
                    <PostCard
                      key={p.slug}
                      post={p}
                      locale={locale}
                      onRequest={onRequestLabel}
                      headingLevel="h3"
                      readingLabel={(minutes) => tJournal('readingTime', { minutes })}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          <Invitation />
        </main>

        <SiteFooter onHome={false} />
        <BookingPanel />
        <MotionRoot />

        <JsonLd
          data={[
            serviceSchema({
              name: copy.card.title,
              description: copy.meta.description,
              route: page.route,
              locale,
              serviceType: page.serviceType,
              serviceIds: page.services,
            }),
            breadcrumbSchema(crumbs, locale),
            faqSchema(copy.faq.items),
          ]}
        />
      </>
    );
  }

  return { generateMetadata, Page };
}
