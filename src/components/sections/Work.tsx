import Image, { type StaticImageData } from 'next/image';
import { getTranslations } from 'next-intl/server';

import balayageFront from '@/assets/images/work/work-balayage-front.jpg';
import balayageBack from '@/assets/images/work/work-balayage-back.jpg';
import brunetteVolume from '@/assets/images/work/work-brunette-volume.jpg';
import brunetteWaves from '@/assets/images/work/work-brunette-waves.jpg';
import foils from '@/assets/images/work/work-foils.jpg';
import blowout from '@/assets/images/work/work-blowout.jpg';
import finish from '@/assets/images/work/work-finish.jpg';
import glow from '@/assets/images/work/work-brunette-glow.jpg';
import { contact } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import styles from './Work.module.css';

/**
 * Not in Panfili's repo build, but on its live site ("Craft you can see"),
 * and for a colourist it is the section that sells: the work itself. Every
 * frame is from @emrahair's own reels, so nothing here is borrowed.
 *
 * Desktop: an editorial grid with two tall plates. Phone: a swipe rail.
 */
const TILES: { key: string; src: StaticImageData; tall?: boolean; pos?: string }[] = [
  { key: 'airtouch', src: balayageFront, tall: true, pos: '50% 30%' },
  { key: 'volume', src: brunetteVolume, pos: '50% 35%' },
  { key: 'foils', src: foils, pos: '50% 40%' },
  { key: 'length', src: balayageBack, tall: true, pos: '50% 45%' },
  { key: 'waves', src: brunetteWaves, pos: '50% 45%' },
  { key: 'blowout', src: blowout, pos: '50% 35%' },
  { key: 'finish', src: finish, pos: '50% 35%' },
  { key: 'glow', src: glow, pos: '50% 40%' },
];

export async function Work() {
  const t = await getTranslations('work');

  return (
    <section className={`${styles.work} section--light on-light`} id="work" aria-labelledby="work-title">
      <div className="shell">
        <header className={styles.head}>
          <span className="eyebrow" data-reveal>
            {t('eyebrow')}
          </span>
          <Headline
            id="work-title"
            className={styles.title}
            lines={t.raw('titleLines') as string[]}
            accent={t('titleAccent')}
          />
          <p className={styles.lede} data-reveal>
            {t('lede')}
          </p>
        </header>

        <ul className={styles.grid} data-drag-scroll>
          {TILES.map((tile) => (
            <li className={`${styles.tile} ${tile.tall ? styles.tall : ''}`} key={tile.key}>
              <figure className={styles.figure} data-reveal-media>
                <div className={`media ${styles.media}`}>
                  <Image
                    src={tile.src}
                    alt={t(`tiles.${tile.key}.alt`)}
                    sizes="(max-width: 899px) 70vw, 25vw"
                    quality={72}
                    style={{ objectPosition: tile.pos }}
                  />
                </div>
                <figcaption className={styles.caption}>{t(`tiles.${tile.key}.label`)}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className={styles.foot}>
          <a className="link-arrow" href={contact.instagram} target="_blank" rel="noreferrer noopener" data-reveal>
            <span>{t('cta')}</span>
            <span className="link-arrow__line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
