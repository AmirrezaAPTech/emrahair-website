import { getTranslations } from 'next-intl/server';

import { contact } from '@/lib/site';
import styles from './Reels.module.css';

/**
 * Four of @emrahair's own reels, self-hosted (see scripts/build-media.mjs):
 * an Instagram embed would load Meta's script and set its cookies on every
 * visit. Each tile links to the original post.
 */
const REELS = [
  { n: 1, id: 'DcA6jNtulXJ' },
  { n: 2, id: 'DbNQEBTsxpZ' },
  { n: 3, id: 'DZhzy8wM0lD' },
  { n: 4, id: 'DWyJYA6DETU' },
] as const;

const reelUrl = (id: string) => `https://www.instagram.com/emrahair/reel/${id}/`;

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function Reels() {
  const t = await getTranslations('reels');

  return (
    <section className={`${styles.reels} section--light on-light`} aria-label={t('label')}>
      <div className={`shell ${styles.inner}`}>
        <ul className={styles.rail}>
          {REELS.map(({ n, id }) => (
            <li className={styles.tile} key={id}>
              <a className={styles.tileLink} href={reelUrl(id)} target="_blank" rel="noreferrer noopener" aria-label={t('tileLabel')}>
                <span className={styles.glyph}>
                  <InstagramGlyph />
                </span>
              </a>
              <video
                className={styles.video}
                data-svc-video
                src={`/videos/reels/${n}.mp4?v=2#t=0.001`}
                preload="metadata"
                muted
                loop
                playsInline
                aria-hidden="true"
                tabIndex={-1}
              />
            </li>
          ))}
        </ul>

        <div className={styles.foot}>
          <a className="link-arrow" href={contact.instagram} target="_blank" rel="noreferrer noopener">
            <span>{t('cta', { handle: contact.instagramHandle })}</span>
            <span className="link-arrow__line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
