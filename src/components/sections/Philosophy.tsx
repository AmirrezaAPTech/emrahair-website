import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import finish from '@/assets/images/about-main.jpg';
import terrace from '@/assets/images/salon-terrace.jpg';
import balayageBack from '@/assets/images/work/work-balayage-back.jpg';
import { Headline } from '@/components/ui/Headline';
import { ArrowLink } from '@/components/ui/LinkArrow';
import styles from './Philosophy.module.css';

/**
 * The masthead over a triptych: the terrace lounge, the finish at the mirror,
 * and a finished balayage. Phone keeps the centre plate alone. The centre
 * photograph is never captioned with a name: it came from Schwarzkopf Pro
 * TR's feed and the stylist in it is not confirmed.
 */
export async function Philosophy() {
  const t = await getTranslations('philosophy');

  return (
    <section
      className={`${styles.phil} section--light on-light`}
      id="philosophy"
      aria-labelledby="phil-title"
    >
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
              <Image src={terrace} alt={t('plateAlt')} sizes="(max-width: 899px) 60vw, 30vw" quality={72} />
            </div>
          </figure>

          <figure className={`${styles.frame} ${styles.frameFloor}`} data-reveal-media>
            <div className={`media ${styles.frameMedia} ${styles.ritual}`}>
              <Image src={finish} alt={t('imageAlt')} sizes="(max-width: 899px) 100vw, 42vw" quality={76} priority />
            </div>
            <figcaption className={styles.caption}>
              <span className="numeral">01</span>
              <span>{t('caption')}</span>
            </figcaption>
          </figure>

          <figure className={`${styles.frame} ${styles.frameWall}`} data-reveal-media>
            <div className={`media ${styles.frameMedia}`}>
              <Image src={balayageBack} alt={t('galleryAlt')} sizes="(max-width: 899px) 60vw, 30vw" quality={72} />
            </div>
          </figure>
        </div>

        <figure className={styles.phonePlate} data-reveal-media>
          <div className={`media ${styles.phonePlateMedia} ${styles.ritual}`}>
            <Image src={finish} alt={t('imageAlt')} sizes="100vw" quality={76} />
          </div>
        </figure>

        <p className={styles.manifesto} data-reveal>
          {t('manifesto')}
        </p>

        <ArrowLink href="#atelier" className={styles.cta}>
          {t('cta')}
        </ArrowLink>
      </div>
    </section>
  );
}
