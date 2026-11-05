import Image, { getImageProps, type StaticImageData } from 'next/image';
import { getTranslations } from 'next-intl/server';

import a1 from '@/assets/images/work/01-A.jpg';
import a2Poster from '@/assets/images/work/02-A-poster.jpg';
import a3 from '@/assets/images/work/03-A.jpg';
import b4 from '@/assets/images/work/04-B.jpg';
import b5Poster from '@/assets/images/work/05-B-poster.jpg';
import c6 from '@/assets/images/work/06-C.jpg';
import d7Poster from '@/assets/images/work/07-D-poster.jpg';
import e8 from '@/assets/images/work/08-E.jpg';
import { contact } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import styles from './Work.module.css';

/**
 * The client's "Çalışmalar" files, in alphabetical order of their original
 * names (see media-src/calismalar/README.md). Photos and loops are mixed, so
 * the grid is uniform — four portrait plates by two rows — which keeps the
 * order exactly as given; tall plates would make the grid reflow them.
 *
 * Videos are silent loops that play only while on screen
 * (motion/modules/service-video); each has a poster for the first paint.
 * Bump VIDEO_VERSION when they are re-encoded (the /videos cache is a year).
 */
const VIDEO_VERSION = 1;

type Tile =
  | { key: string; kind: 'photo'; src: StaticImageData }
  | { key: string; kind: 'video'; file: string; poster: StaticImageData };

const TILES: Tile[] = [
  { key: 'a1', kind: 'photo', src: a1 },
  { key: 'a2', kind: 'video', file: '02-A', poster: a2Poster },
  { key: 'a3', kind: 'photo', src: a3 },
  { key: 'b4', kind: 'photo', src: b4 },
  { key: 'b5', kind: 'video', file: '05-B', poster: b5Poster },
  { key: 'c6', kind: 'photo', src: c6 },
  { key: 'd7', kind: 'video', file: '07-D', poster: d7Poster },
  { key: 'e8', kind: 'photo', src: e8 },
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
            <li className={styles.tile} key={tile.key}>
              <figure className={styles.figure} data-reveal-media>
                <div className={`media ${styles.media}`}>
                  {tile.kind === 'photo' ? (
                    <Image src={tile.src} alt={t(`tiles.${tile.key}.alt`)} sizes="(max-width: 899px) 70vw, 25vw" quality={76} />
                  ) : (
                    <video
                      className={styles.video}
                      data-svc-video
                      src={`/videos/work/${tile.file}.mp4?v=${VIDEO_VERSION}#t=0.001`}
                      poster={getImageProps({ src: tile.poster, alt: '', width: 720, quality: 72 }).props.src}
                      preload="none"
                      muted
                      loop
                      playsInline
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  )}
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
