import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, htmlLang, ogLocale, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SiteNav } from '@/components/chrome/SiteNav';
import { BookingPanel } from '@/components/chrome/BookingPanel';
import { MotionRoot } from '@/components/chrome/MotionRoot';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { Headline } from '@/components/ui/Headline';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/ui/JsonLd';
import { PostCard } from '@/components/journal/PostCard';
import { RichText, plain } from '@/components/journal/RichText';
import {
  allPosts,
  lastModified,
  postBySlug,
  postHref,
  postUrl,
  postsIn,
  readingMinutes,
  translationsOf,
  wordCount,
} from '@/lib/journal';
import { HEROES, POST_HERO } from '@/lib/heroes';
import { site } from '@/lib/site';
import { blogPostingSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import styles from '@/components/service/ServicePage.module.css';
import j from '@/components/journal/Journal.module.css';

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return allPosts().map((p) => ({ locale: p.locale, slug: p.slug }));
}

export const dynamicParams = false;

const heroFor = (key: string, hero: string | null) => HEROES[hero ?? POST_HERO[key] ?? ''] ?? null;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const post = postBySlug(locale, slug);
  if (!post) return {};
  const onRequest = (await getTranslations({ locale, namespace: 'booking' }))('onRequest');
  const alts = (await getTranslations({ locale, namespace: 'journal' })).raw('alts') as Record<string, string>;
  const pairs = translationsOf(post.key);
  const url = postUrl(locale, slug);
  const hero = heroFor(post.key, post.hero);
  const description = plain(post.description, locale, onRequest);

  return {
    title: { absolute: post.seoTitle },
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          (Object.entries(pairs) as [Locale, string][]).map(([l, s]) => [htmlLang[l], postUrl(l, s)]),
        ),
        ...(pairs[routing.defaultLocale] ? { 'x-default': postUrl(routing.defaultLocale, pairs[routing.defaultLocale]!) } : {}),
      },
    },
    openGraph: {
      type: 'article',
      siteName: site.legalName,
      url,
      title: post.seoTitle,
      description,
      locale: ogLocale[locale],
      publishedTime: post.publishedAt,
      modifiedTime: lastModified(post),
      authors: [`${site.url}/emrah-cabkur`],
      tags: post.tags,
      /* The 1200 × 630 crop from scripts/build-og.mjs; the portrait hero is for the page. */
      images: [
        {
          url: hero ? `/og/post-${post.key}.jpg` : '/og-emrahair.jpg',
          width: 1200,
          height: 630,
          alt: post.heroAlt || alts[post.key] || post.title,
        },
      ],
    },
    twitter: { card: 'summary_large_image', title: post.seoTitle, description },
  };
}

export default async function PostPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const post = postBySlug(locale, slug);
  if (!post) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('journal');
  const tService = await getTranslations('service');
  const tMeta = await getTranslations('meta');
  const tPages = await getTranslations('pages');
  const onRequest = (await getTranslations('booking'))('onRequest');
  const alts = t.raw('alts') as Record<string, string>;

  const hero = heroFor(post.key, post.hero);
  const heroAlt = post.heroAlt || alts[post.key] || '';
  const url = postUrl(locale, slug);
  const pairs = translationsOf(post.key);
  const languageHref = Object.fromEntries(
    (Object.entries(pairs) as [Locale, string][]).map(([l, s]) => [l, postHref(s)]),
  ) as Partial<Record<Locale, ReturnType<typeof postHref>>>;

  const others = postsIn(locale).filter((p) => p.slug !== slug).slice(0, 3);
  const fmt = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  /* A related page's own name and summary, so the hand-off never needs new copy. */
  const related = post.relatedPages.map((route) => {
    const key = route.slice(1);
    const card = tPages.has(`${key}.card`) ? (tPages.raw(`${key}.card`) as { title: string; summary: string }) : null;
    const meta = tPages.has(`${key}.meta`) ? (tPages.raw(`${key}.meta`) as { title: string; description: string }) : null;
    return { route, title: card?.title ?? meta?.title.split(' | ')[0] ?? key, summary: card?.summary ?? meta?.description ?? '' };
  });

  const crumbs = [
    { name: tService('home'), route: '/' as const },
    { name: t('breadcrumb'), route: '/blog' as const },
  ];
  const r = (text: string) => <RichText text={text} locale={locale} onRequest={onRequest} linkClass={j.inlineLink} />;

  return (
    <>
      <a className="skip-link" href="#main">
        {tMeta('skipToContent')}
      </a>
      <SiteNav languageHref={languageHref} />

      <main id="main">
        <article>
          <header className={`${styles.mast} section--dark on-dark grain`} data-hero>
            <div className={`shell ${styles.mastGrid}`}>
              <div className={styles.mastText}>
                <nav aria-label={tService('breadcrumbLabel')} data-hero-eyebrow>
                  <ol className={j.meta}>
                    {crumbs.map((c) => (
                      <li key={c.route}>
                        <Link href={c.route}>{c.name}</Link>
                      </li>
                    ))}
                  </ol>
                </nav>
                <Headline as="h1" size="l" lines={[post.title]} />
                <p className={`${styles.lede}`} data-hero-cta>
                  {r(post.lede)}
                </p>
                <p className={j.meta} data-hero-cta>
                  <span>{t('by')}</span>
                  <span>
                    {t('published')} <time dateTime={post.publishedAt}>{fmt(post.publishedAt)}</time>
                  </span>
                  {post.updatedAt && (
                    <span>
                      {t('updated')} <time dateTime={post.updatedAt}>{fmt(post.updatedAt)}</time>
                    </span>
                  )}
                  <span>{t('readingTime', { minutes: readingMinutes(post) })}</span>
                </p>
              </div>
              {hero && (
                <figure className={`media ${styles.mastMedia}`} data-hero-cta>
                  <Image src={hero} alt={heroAlt} fill sizes="(max-width: 899px) 100vw, 40vw" quality={72} priority style={{ objectFit: 'cover' }} />
                </figure>
              )}
            </div>
          </header>

          <section className={`${styles.body} section--light on-light`}>
            <div className={`shell ${styles.bodyGrid}`}>
              <div className={j.prose}>
                {post.sections.map((s) => (
                  <section key={s.heading}>
                    <h2 className="display display--m">{s.heading}</h2>
                    {s.body.map((p, i) => (
                      <p key={i}>{r(p)}</p>
                    ))}
                    {s.list && (
                      <ul>
                        {s.list.map((li, i) => (
                          <li key={i}>{r(li)}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}

                {post.faq.length > 0 && (
                  <section aria-labelledby="post-faq">
                    <h2 id="post-faq" className="display display--m">
                      {t('faqHeading')}
                    </h2>
                    <div className={styles.faqList}>
                      {post.faq.map((it, i) => (
                        <details key={it.q} className={styles.qa} open={i === 0}>
                          <summary className={styles.q}>
                            <h3>{it.q}</h3>
                            <span className={styles.qMark} aria-hidden="true" />
                          </summary>
                          <p className={styles.a}>{r(it.a)}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                <div className={j.cta}>
                  <h2 className="display display--s">{t('ctaHeading')}</h2>
                  <p>{t('ctaBody')}</p>
                  <button className="btn" type="button" data-book-open>
                    {t('cta')}
                  </button>
                </div>
              </div>

              <aside className={styles.aside} aria-label={t('related')}>
                <span className="eyebrow eyebrow--muted">{t('related')}</span>
                <ul className={j.relatedRow}>
                  {related.map((rel) => (
                    <li key={rel.route} className={styles.facts}>
                      <Link className="link-arrow" href={rel.route}>
                        <span>{rel.title}</span>
                        <span className="link-arrow__line" aria-hidden="true" />
                      </Link>
                      <span className={styles.relatedSummary}>{rel.summary}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </section>
        </article>

        {others.length > 0 && (
          <section className={`${styles.related} section--light on-light`} aria-labelledby="more-posts">
            <div className="shell">
              <h2 id="more-posts" className={`eyebrow ${styles.relatedTitle}`}>
                {t('more')}
              </h2>
              <div className={j.list}>
                {others.map((p) => (
                  <PostCard
                    key={p.slug}
                    post={p}
                    locale={locale}
                    onRequest={onRequest}
                    headingLevel="h3"
                    readingLabel={(minutes) => t('readingTime', { minutes })}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter onHome={false} />
      <BookingPanel />
      <MotionRoot />
      <JsonLd
        data={[
          blogPostingSchema({
            url,
            locale,
            headline: post.title,
            description: plain(post.description, locale, onRequest),
            datePublished: post.publishedAt,
            dateModified: lastModified(post),
            wordCount: wordCount(post),
            image: hero ? { url: `${site.url}${hero.src}`, width: hero.width, height: hero.height } : null,
            keywords: post.tags,
            about: post.relatedPages,
          }),
          {
            ...breadcrumbSchema(crumbs, locale),
            itemListElement: [
              ...breadcrumbSchema(crumbs, locale).itemListElement,
              { '@type': 'ListItem', position: 3, name: post.title, item: url },
            ],
          },
          ...(post.faq.length ? [faqSchema(post.faq.map((f) => ({ q: f.q, a: plain(f.a, locale, onRequest) })))] : []),
        ]}
      />
    </>
  );
}
