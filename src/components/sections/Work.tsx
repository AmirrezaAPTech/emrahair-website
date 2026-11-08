import Image, { getImageProps, type StaticImageData } from 'next/image';
import { getTranslations } from 'next-intl/server';

import a1 from '@/assets/images/work/01-A.jpg';
import a3 from '@/assets/images/work/03-A.jpg';
import b4 from '@/assets/images/work/04-B.jpg';
import c6 from '@/assets/images/work/06-C.jpg';
import e8 from '@/assets/images/work/08-E.jpg';
import vbPoster from '@/assets/images/work/edited-b-poster.jpg';
import vePoster from '@/assets/images/work/edited-e-poster.jpg';
import vfPoster from '@/assets/images/work/edited-f-poster.jpg';
import vgPoster from '@/assets/images/work/edited-g-poster.jpg';
import { contact } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import styles from './Work.module.css';

/**
 * The client's order (2026-11-08): the four edited films first, editedB as the
 * opening one, then the photographs. Every tile is the same size, in the
 * same grid as before; only the films and their order changed.
 *
 * Videos are silent loops that play only while on screen
 * (motion/modules/service-video); each has a poster for the first paint.
 * Bump VIDEO_VERSION when they are re-encoded (the /videos cache is a year).
 */
const VIDEO_VERSION = 3;

type Tile =
  | { key: string; kind: 'photo'; src: StaticImageData }
  | { key: string; kind: 'video'; file: string; poster: StaticImageData };

const TILES: Tile[] = [
  { key: 'vb', kind: 'video', file: 'edited-b', poster: vbPoster },
  { key: 've', kind: 'video', file: 'edited-e', poster: vePoster },
  { key: 'vf', kind: 'video', file: 'edited-f', poster: vfPoster },
  { key: 'vg', kind: 'video', file: 'edited-g', poster: vgPoster },
  { key: 'a1', kind: 'photo', src: a1 },
  { key: 'a3', kind: 'photo', src: a3 },
  { key: 'b4', kind: 'photo', src: b4 },
  { key: 'c6', kind: 'photo', src: c6 },
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
