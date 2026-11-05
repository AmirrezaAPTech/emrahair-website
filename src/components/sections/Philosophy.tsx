import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import stations from '@/assets/images/salon/stations.jpg';
import terrace from '@/assets/images/salon/terrace.jpg';
import productWall from '@/assets/images/salon/product-wall.jpg';
import { Headline } from '@/components/ui/Headline';
import { Link } from '@/i18n/navigation';
import styles from './Philosophy.module.css';

/**
 * Panfili's masthead and triptych, unchanged in layout: the whole house in
 * one glance. The three plates are the salon's own Google Maps photographs —
 * the styling stations, the terrace lounge (centre, captioned) and the
 * orange product wall. Phone keeps the terrace alone, full bleed.
 *
 * The `sizes` over-declare on purpose, as on Panfili: every source here is
 * portrait and the frames crop hard, so a truthful box width would buy a
 * file the crop then upscales.
 */
export async function Philosophy() {
  const t = await getTranslations('philosophy');

  return (
    <section className={`${styles.phil} section--light on-light`} id="philosophy" aria-labelledby="phil-title">
      <div className={styles.stage}>
        <span className={`eyebrow ${styles.eyebrow}`} data-reveal>
          {t('eyebrow')}
        </span>

        <Headline
          id="phil-title"
          className={styles.title}
          lines={t.raw('titleLines') as string[]}
          accent={t('titleAccent')}
        />

        <div className={styles.copy} data-reveal>
          <p className={styles.note}>
            {t.rich('lede', {
              brand: (chunks) => <em className={styles.brand}>{chunks}</em>,
            })}
          </p>
        </div>

        <div className={styles.triptych}>
          <figure className={`${styles.frame} ${styles.frameRoom}`} data-reveal-media>
            <div className={`media ${styles.frameMedia}`}>
              <Image src={stations} alt={t('plateAlt')} sizes="(max-width: 899px) 60vw, 40vw" quality={72} />
            </div>
          </figure>

          <figure className={`${styles.frame} ${styles.frameFloor}`} data-reveal-media>
            <div className={`media ${styles.frameMedia}`}>
              <Image src={terrace} alt={t('imageAlt')} sizes="(max-width: 899px) 100vw, 57vw" quality={72} priority />
            </div>
            <figcaption className={styles.caption}>
              <span className="numeral">01</span>
              <span>{t('caption')}</span>
            </figcaption>
          </figure>

          <figure className={`${styles.frame} ${styles.frameWall}`} data-reveal-media>
            <div className={`media ${styles.frameMedia}`}>
              <Image src={productWall} alt={t('galleryAlt')} sizes="(max-width: 899px) 60vw, 40vw" quality={72} />
            </div>
          </figure>
        </div>

        <figure className={styles.phonePlate} data-reveal-media>
          <div className={`media ${styles.phonePlateMedia}`}>
            <Image src={terrace} alt={t('imageAlt')} sizes="100vw" quality={72} />
          </div>
        </figure>

        <p className={styles.manifesto} data-reveal>
          {t('manifesto')}
        </p>

        <Link href="/emrah-cabkur" className={`link-arrow ${styles.cta}`} data-reveal>
          <span>{t('cta')}</span>
          <span className="link-arrow__line" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
