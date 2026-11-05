import { getImageProps } from 'next/image';
import { getTranslations } from 'next-intl/server';

import heroPosterDesktop from '@/assets/images/hero-poster-desktop.jpg';
import heroPosterMobile from '@/assets/images/hero-poster-mobile.jpg';
import { Headline } from '@/components/ui/Headline';
import { Link } from '@/i18n/navigation';
import { ratings } from '@/lib/site';
import styles from './Hero.module.css';

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations('hero');

  /* The two stills are frames of the two cuts (16:9 and a 9:16 window on her
     face), so the poster is the picture the video starts moving from. */
  const common = { alt: t('imageAlt'), sizes: '100vw', quality: 68 };
  const {
    props: { srcSet: desktopSrcSet, ...rest },
  } = getImageProps({ ...common, src: heroPosterDesktop, width: 1920, height: 1080, priority: true });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: heroPosterMobile, width: 720, height: 1280 });

  const score = ratings.kolayRandevu.score.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US');

  return (
    <section className={`${styles.hero} on-dark grain`} id="top" data-hero>
      <div className={styles.media} data-hero-media>
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
          {/* eslint-disable-next-line jsx-a11y/alt-text -- carried by ...rest */}
          <img {...rest} decoding="async" fetchPriority="high" />
        </picture>

        {/* No src in the markup: motion/modules/hero-video picks the cut for
            the viewport and only then loads it. Reduced motion keeps the still. */}
        <video
          className={styles.video}
          data-hero-video
          data-src-desktop="/videos/hero/hero-desktop.mp4?v=2"
          data-src-mobile="/videos/hero/hero-mobile.mp4?v=2"
          preload="none"
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner} data-hero-inner>
        <p className={`eyebrow ${styles.eyebrow}`} data-hero-eyebrow>
          {t('eyebrow')}
        </p>

        <Headline
          as="h1"
          size="hero"
          className={styles.title}
          lines={t.raw('titleLines') as string[]}
          accent={t('titleAccent')}
        />

        <div className={styles.cta} data-hero-cta>
          <button className="btn" type="button" data-book-open>
            {t('cta')}
          </button>
          <Link className="link-arrow" href="/hizmetler">
            <span>{t('prices')}</span>
            <span className="link-arrow__line" aria-hidden="true" />
          </Link>
        </div>

        <p className={styles.meta} data-hero-cta>
          <span className={styles.score}>{score}</span>
          <span className={styles.stars} aria-hidden="true">
            ★★★★★
          </span>
          <span>{t('meta', { count: ratings.kolayRandevu.count })}</span>
        </p>
      </div>
    </section>
  );
}
