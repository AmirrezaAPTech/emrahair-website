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
import { MapEmbed } from '@/components/ui/MapEmbed';
import { contact, hours } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, contactPageSchema } from '@/lib/schema';
import styles from '@/components/service/ServicePage.module.css';
import own from './page.module.css';

type Copy = Record<
  | 'breadcrumb'
  | 'eyebrow'
  | 'titleAccent'
  | 'lede'
  | 'addressHeading'
  | 'phoneHeading'
  | 'hoursHeading'
  | 'hoursNote'
  | 'mapHeading'
  | 'mapLoad'
  | 'mapNote'
  | 'directions'
  | 'areaHeading'
  | 'areaBody'
  | 'bookHeading'
  | 'bookBody',
  string
> & { meta: { title: string; description: string }; titleLines: string[] };

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages' });
  const c = t.raw('iletisim') as Copy;
  return pageMetadata({ locale, route: '/iletisim', title: c.meta.title, description: c.meta.description, image: '/og/iletisim.jpg' });
}

export default async function ContactPage({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const c = (await getTranslations('pages')).raw('iletisim') as Copy;
  const t = await getTranslations('service');
  const tMeta = await getTranslations('meta');
  const tHours = await getTranslations('hours');
  const tFooter = await getTranslations('footer');

  const crumbs = [
    { name: t('home'), route: '/' as const },
    { name: c.breadcrumb, route: '/iletisim' as const },
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
              <Breadcrumb items={crumbs} label={t('breadcrumbLabel')} />
              <span className="eyebrow">{c.eyebrow}</span>
              <Headline as="h1" size="xl" lines={c.titleLines.map((l) => `${l.trimEnd()} `)} accent={c.titleAccent} />
              <p className={styles.lede} data-hero-cta>
                {c.lede}
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.body} section--light on-light`}>
          <div className={`shell ${own.grid}`}>
            <div className={own.card}>
              <h2 className="eyebrow eyebrow--muted">{c.addressHeading}</h2>
              <address className={own.value}>
                Emrahair
                <br />
                {contact.district}
                <br />
                {contact.street}
                <br />
                {contact.postal} {contact.city}
              </address>
              <a className="link-arrow" href={contact.mapsUrl} target="_blank" rel="noreferrer noopener">
                <span>{c.directions}</span>
                <span className="link-arrow__line" aria-hidden="true" />
              </a>
            </div>

            <div className={own.card}>
              <h2 className="eyebrow eyebrow--muted">{c.phoneHeading}</h2>
              <p className={own.value}>
                <a href={contact.phoneHref}>{contact.phone}</a>
                <br />
                <a href={contact.whatsapp} target="_blank" rel="noreferrer noopener">
                  {tFooter('whatsapp')} · {contact.mobile}
                </a>
                <br />
                <a href={contact.instagram} target="_blank" rel="noreferrer noopener">
                  Instagram {contact.instagramHandle}
                </a>
              </p>
            </div>

            <div className={own.card}>
              <h2 className="eyebrow eyebrow--muted">{c.hoursHeading}</h2>
              <dl className={own.hours}>
                {hours.map((h) => (
                  <div key={h.day}>
                    <dt>{tHours(h.day)}</dt>
                    <dd>{h.open ? `${h.open}–${h.close}` : tHours('closed')}</dd>
                  </div>
                ))}
              </dl>
              <p className={own.note}>{c.hoursNote}</p>
            </div>

            <div className={own.card}>
              <h2 className="eyebrow eyebrow--muted">{c.bookHeading}</h2>
              <p className={own.note}>{c.bookBody}</p>
              <button className="btn" type="button" data-book-open>
                {t('book')}
              </button>
            </div>
          </div>

          <div className={`shell ${own.mapRow}`}>
            <div className={own.area}>
              <h2 className="display display--m">{c.areaHeading}</h2>
              <p className={styles.para}>{c.areaBody}</p>
            </div>
            <div>
              <h2 className="visually-hidden">{c.mapHeading}</h2>
              <MapEmbed src={contact.mapsEmbed} title={c.mapHeading} load={c.mapLoad} note={c.mapNote} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd data={[contactPageSchema(locale, c.meta.title, c.meta.description), breadcrumbSchema(crumbs, locale)]} />
    </>
  );
}
