import { getLocale, getTranslations } from 'next-intl/server';

import { ratings, reviews } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import styles from './Testimonials.module.css';

type Review = (typeof reviews)[number];

const rowA = reviews.slice(0, 6);
const rowB = reviews.slice(6, 12);

function Stars() {
  return (
    <span className={styles.cardStars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 6.05 6.6.86-4.85 4.6 1.24 6.54L12 17.4l-5.89 3.15 1.24-6.54L2.5 9.41l6.6-.86z" />
        </svg>
      ))}
    </span>
  );
}

function Card({ r }: { r: Review }) {
  return (
    <article className={styles.card}>
      <Stars />
      <p className={styles.cardText}>“{r.quote}”</p>
      <p className={styles.cardMeta}>
        <span className={styles.cardAuthor}>{r.name}</span>
        <span className={styles.cardSource}>{r.source}</span>
      </p>
    </article>
  );
}

/** Each row is its list twice, so the marquee loops without a seam. */
function Row({ items, reverse }: { items: readonly Review[]; reverse?: boolean }) {
  const run = (half: string) =>
    items.map((r, i) => (
      <li className={styles.item} key={`${half}-${i}`}>
        <Card r={r} />
      </li>
    ));
  return (
    <div className={styles.row}>
      <ul className={styles.track} data-reverse={reverse ? '' : undefined}>
        {run('a')}
        {run('b')}
      </ul>
    </div>
  );
}

export async function Testimonials() {
  const t = await getTranslations('testimonials');
  const locale = await getLocale();
  const fmt = (n: number) => n.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US');

  return (
    <section className={`${styles.wrap} on-light`} id="reviews" aria-labelledby="testimonials-title">
      <div className={`shell ${styles.head}`}>
        <span className="eyebrow" data-reveal>
          {t('eyebrow')}
        </span>

        <Headline
          id="testimonials-title"
          className={styles.title}
          lines={t.raw('titleLines') as string[]}
          accent={t('titleAccent')}
        />

        <p className={styles.aggregate} data-reveal>
          <span className={styles.score}>{fmt(ratings.kolayRandevu.score)}</span>
          <span className={styles.aggStars} aria-hidden="true">
            ★★★★★
          </span>
          <span className={styles.count}>
            {t('countKr', { count: ratings.kolayRandevu.count })}
            <span className={styles.aggSep} aria-hidden="true">
              ·
            </span>
            {t('countGoogle', { score: fmt(ratings.google.score), count: ratings.google.count })}
          </span>
        </p>
      </div>

      {/* The ribbon is decoration over a list a reader can get in full on the
          salon's Kolay Randevu page, so it is hidden from assistive tech. */}
      <div className={styles.rows} aria-hidden="true">
        <Row items={rowA} />
        <Row items={rowB} reverse />
      </div>

      <div className={`shell ${styles.foot}`}>
        <a className="link-arrow" href={ratings.kolayRandevu.url} target="_blank" rel="noreferrer noopener" data-reveal>
          <span>{t('cta', { count: ratings.kolayRandevu.reviews })}</span>
          <span className="link-arrow__line" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
