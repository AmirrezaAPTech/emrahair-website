import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Headline } from '@/components/ui/Headline';
import { ServicesGrid } from './ServicesGrid';
import styles from './Services.module.css';

/**
 * The landing page's services section: the masthead across the full measure,
 * and the six service cards beneath it, each a link to its own page.
 */
export async function Services() {
  const t = await getTranslations('services');

  return (
    <section
      className={`${styles.svc} section--dark on-dark`}
      id="services"
      aria-labelledby="svc-title"
    >
      <div className="shell">
        {/* The masthead takes the full measure at the top, which is what lets
            the row beneath it be plates rather than thumbnails. */}
        <header className={styles.label}>
          <div className={styles.labelText}>
            <span className="eyebrow" data-reveal>
              {t('eyebrow')}
            </span>

            <Headline
              id="svc-title"
              className={styles.title}
              lines={t.raw('titleLines') as string[]}
              accent={t('titleAccent')}
            />
          </div>

          <Link className={`btn ${styles.cta}`} href="/hizmetler" data-reveal>
            {t('cta')}
          </Link>
        </header>

        <ServicesGrid />
      </div>
    </section>
  );
}
