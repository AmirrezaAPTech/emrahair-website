import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { Invitation } from '@/components/sections/Invitation';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { Headline } from '@/components/ui/Headline';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/ui/JsonLd';
import { PostCard } from '@/components/journal/PostCard';
import { postsIn, postUrl } from '@/lib/journal';
import { pageMetadata } from '@/lib/seo';
import { blogSchema, breadcrumbSchema } from '@/lib/schema';
import styles from '@/components/service/ServicePage.module.css';
import j from '@/components/journal/Journal.module.css';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'journal.meta' });
  return pageMetadata({ locale, route: '/blog', title: t('title'), description: t('description'), image: '/og/blog.jpg' });
}

export default async function JournalIndex({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('journal');
  const tService = await getTranslations('service');
  const tMeta = await getTranslations('meta');
  const onRequest = (await getTranslations('booking'))('onRequest');
  const posts = postsIn(locale);

  const crumbs = [
    { name: tService('home'), route: '/' as const },
    { name: t('breadcrumb'), route: '/blog' as const },
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

        <section className={`${j.index} section--light on-light`}>
          <div className={`shell ${j.list}`}>
            {posts.map((p) => (
              <PostCard
                key={p.slug}
                post={p}
                locale={locale}
                onRequest={onRequest}
                readingLabel={(minutes) => t('readingTime', { minutes })}
              />
            ))}
          </div>
        </section>

        <Invitation />
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd
        data={[
          blogSchema(
            locale,
            t('meta.title'),
            t('meta.description'),
            posts.map((p) => ({ url: postUrl(locale, p.slug), headline: p.title, datePublished: p.publishedAt })),
          ),
          breadcrumbSchema(crumbs, locale),
        ]}
      />
    </>
  );
}
