import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { DISCIPLINES, disciplineFrom } from '@/lib/disciplines';
import { formatTL } from '@/lib/site';
import styles from './Services.module.css';

/**
 * `#t=0.001` makes the browser paint the opening frame from metadata alone.
 * `?v=` busts the year-long cache on /videos (next.config.ts): bump it
 * whenever the clips are re-encoded, or returning visitors keep the old ones.
 */
const CLIP_VERSION = 2;
const openingFrame = (key: string) => `/videos/services/${key}.mp4?v=${CLIP_VERSION}#t=0.001`;

export async function ServicesGrid() {
  const t = await getTranslations('services');
  const locale = await getLocale();

  return (
    <div className={styles.grid}>
      {DISCIPLINES.map((d) => (
        <article className={styles.card} key={d.key}>
          <span className={`media ${styles.cardMedia}`} data-reveal-media>
            {d.clip ? (
              /* Decorative loop; the heading and link say what the card is.
                 Plays only in view — motion/modules/service-video. */
              <video
                className={styles.cardVideo}
                data-svc-video
                src={openingFrame(d.key)}
                preload="metadata"
                muted
                loop
                playsInline
                aria-hidden="true"
                tabIndex={-1}
              />
            ) : (
              /* No film of the nail and brow room exists yet, so the card
                 carries a plate with the specialist's name instead of a
                 borrowed stock photo. */
              <span className={styles.cardPlate} aria-hidden="true">
                <span className={styles.cardPlateMark}>G</span>
                <span className={styles.cardPlateName}>Gizem Değişener</span>
              </span>
            )}
          </span>

          <h3 className={`display display--s ${styles.cardTitle}`}>
            <Link className={styles.cardLink} href={{ pathname: '/hizmetler', hash: d.group }}>
              {t(`${d.key}.title`)}
            </Link>
          </h3>

          <p className={styles.cardSummary}>{t(`${d.key}.summary`)}</p>

          <span className={styles.cardFrom}>
            {t('from', { price: `${formatTL(disciplineFrom(d.services), locale)} ₺` })}
          </span>
        </article>
      ))}
    </div>
  );
}
