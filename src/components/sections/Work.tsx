import Image, { type StaticImageData } from 'next/image';
import { getTranslations } from 'next-intl/server';

import emrahClient from '@/assets/images/work/emrah-client.jpg';
import pinkWaves from '@/assets/images/work/pink-waves.jpg';
import nailArt from '@/assets/images/work/nail-art.jpg';
import nightSign from '@/assets/images/work/night-sign.jpg';
import copper from '@/assets/images/work/copper.jpg';
import pinkBalayage from '@/assets/images/work/pink-balayage.jpg';
import loungeLights from '@/assets/images/work/lounge-lights.jpg';
import orangeArch from '@/assets/images/work/orange-arch.jpg';
import { contact } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import styles from './Work.module.css';

/**
 * Not in Panfili's repo build, but on its live site ("Craft you can see").
 * Every plate is from the salon's own Google Maps gallery: the work (colour,
 * nails, Emrah at the chair) and the room it is done in.
 *
 * Desktop: five columns by two rows, two plates run tall. Phone: a swipe rail.
 */
const TILES: { key: string; src: StaticImageData; tall?: boolean; pos?: string }[] = [
  { key: 'emrah', src: emrahClient, tall: true, pos: '62% 40%' },
  { key: 'pinkWaves', src: pinkWaves, pos: '50% 40%' },
  { key: 'nails', src: nailArt, pos: '45% 45%' },
  { key: 'night', src: nightSign, tall: true, pos: '50% 55%' },
  { key: 'copper', src: copper, pos: '50% 30%' },
  { key: 'pinkBalayage', src: pinkBalayage, pos: '50% 35%' },
  { key: 'lounge', src: loungeLights, pos: '50% 50%' },
  { key: 'arch', src: orangeArch, pos: '50% 45%' },
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
                    sizes="(max-width: 899px) 70vw, 22vw"
                    quality={76}
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
