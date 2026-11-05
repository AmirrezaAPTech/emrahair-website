import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { SERVICE_PAGES, pageFrom } from '@/lib/service-pages';
import { formatTL } from '@/lib/site';
import styles from './Services.module.css';

/**
 * `#t=0.001` makes the browser paint the opening frame from metadata alone.
 * `?v=` busts the year-long cache on /videos (next.config.ts): bump it
 * whenever the clips are re-encoded, or returning visitors keep the old ones.
 */
const CLIP_VERSION = 3;
const openingFrame = (clip: string) => `/videos/services/${clip}.mp4?v=${CLIP_VERSION}#t=0.001`;

/**
 * Six cards, one per service page. Each is a link to that page, which is what
 * passes the home page's weight on to "balyaj bahçeşehir", "saç kesimi
 * bahçeşehir" and the rest. The card's title and summary are the page's own
 * (pages.<key>.card), so the two can never disagree.
 */
export async function ServicesGrid() {
  const t = await getTranslations('services');
  const tPages = await getTranslations('pages');
  const locale = await getLocale();

  return (
    <div className={styles.grid}>
      {SERVICE_PAGES.filter((p) => p.onHome).map((p) => {
        const card = tPages.raw(`${p.key}.card`) as { title: string; summary: string };
        return (
          <article className={styles.card} key={p.key}>
            <span className={`media ${styles.cardMedia}`} data-reveal-media>
              {p.clip && (
                /* Decorative loop; the heading and link say what the card is.
                   Plays only in view — motion/modules/service-video. */
                <video
                  className={styles.cardVideo}
                  data-svc-video
                  src={openingFrame(p.clip)}
                  preload="metadata"
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  tabIndex={-1}
                />
              )}
            </span>

            <h3 className={`display display--s ${styles.cardTitle}`}>
              <Link className={styles.cardLink} href={p.route}>
                {card.title}
              </Link>
            </h3>

            <p className={styles.cardSummary}>{card.summary}</p>

            <span className={styles.cardFrom}>{t('from', { price: `${formatTL(pageFrom(p), locale)} ₺` })}</span>
          </article>
        );
      })}
    </div>
  );
}
