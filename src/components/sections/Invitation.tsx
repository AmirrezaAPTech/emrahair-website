import { getImageProps } from 'next/image';
import { getTranslations } from 'next-intl/server';

import poster from '@/assets/images/invitation-poster.jpg';
import { contact, hours } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import styles from './Invitation.module.css';

/**
 * The closing plate: caramel balayage in warm light, taken a stop darker so
 * the type sits on it. The clip loads only when the band comes into view
 * (the same service-video module that runs the cards); without JavaScript or
 * with reduced motion it stays on the poster.
 */
export async function Invitation() {
  const t = await getTranslations('invitation');
  const tHours = await getTranslations('hours');

  const {
    props: { srcSet, ...rest },
  } = getImageProps({ alt: '', sizes: '100vw', quality: 62, src: poster, width: 1600, height: 900 });

  return (
    <section className={`${styles.invite} on-dark grain`} id="book" aria-labelledby="invite-title">
      <div className={styles.media}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative, alt="" via ...rest */}
        <img {...rest} srcSet={srcSet} loading="lazy" decoding="async" data-parallax-y="0.16" />
        <video
          className={styles.video}
          data-svc-video
          src="/videos/invitation/invitation.mp4#t=0.001"
          preload="none"
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={`shell ${styles.inner}`}>
        <span className="eyebrow" data-reveal>
          {t('eyebrow')}
        </span>

        <Headline
          id="invite-title"
          className={styles.title}
          lines={t.raw('titleLines') as string[]}
          accent={t('titleAccent')}
        />

        <div className={styles.actions} data-reveal>
          <button className="btn" type="button" data-book-open>
            {t('cta')}
          </button>
          <a className="link-arrow" href={contact.whatsapp} target="_blank" rel="noreferrer noopener">
            <span>{t('whatsapp')}</span>
            <span className="link-arrow__line" aria-hidden="true" />
          </a>
        </div>

        <dl className={styles.hours} data-reveal>
          {hours.map((h) => (
            <div className={styles.hoursRow} key={h.day}>
              <dt>{tHours(h.day)}</dt>
              <dd>{h.open ? `${h.open}–${h.close}` : tHours('closed')}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.byAppointment} data-reveal>
          {contact.street} · {contact.district}
        </p>
      </div>
    </section>
  );
}
