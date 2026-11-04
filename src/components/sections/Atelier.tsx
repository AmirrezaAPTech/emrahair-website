import Image, { type StaticImageData } from 'next/image';
import { getTranslations } from 'next-intl/server';

import ritual from '@/assets/images/ritual.jpg';
import emrah from '@/assets/images/team/emrah.jpg';
import { team } from '@/lib/site';
import { Headline } from '@/components/ui/Headline';
import { ArrowButton } from '@/components/ui/LinkArrow';
import styles from './Atelier.module.css';

/**
 * Portraits the salon has supplied. Everyone else renders the monogram plate,
 * which reads as a frame waiting for its photograph rather than as a gap.
 * Do not pad the roster with stock faces.
 */
const portraits: Partial<Record<(typeof team)[number]['key'], StaticImageData>> = { emrah };

export async function Atelier() {
  const t = await getTranslations('atelier');

  return (
    <>
      {/* --- The founder ---------------------------------------------------- */}
      <section className={`${styles.founder} section--light on-light`} id="atelier" aria-labelledby="atelier-title">
        <div className={styles.grid}>
          <div className={styles.text}>
            <span className="eyebrow" data-reveal>
              {t('eyebrow')}
            </span>

            <Headline
              id="atelier-title"
              className={styles.title}
              lines={t.raw('titleLines') as string[]}
              accent={t('titleAccent')}
            />

            <div className={styles.copy} data-reveal>
              {(t.raw('bodyLines') as string[]).map((line) => (
                <p className={styles.body} key={line}>
                  {line}
                </p>
              ))}
            </div>

            <ul className={styles.facts} data-reveal>
              {(t.raw('facts') as { value: string; label: string }[]).map((f) => (
                <li key={f.label}>
                  <span className={styles.factValue}>{f.value}</span>
                  <span className={styles.factLabel}>{f.label}</span>
                </li>
              ))}
            </ul>

            <ArrowButton>{t('cta')}</ArrowButton>
          </div>

          <figure className={styles.figure} data-reveal-media>
            <div className={`media ${styles.media}`}>
              <Image src={ritual} alt={t('imageAlt')} sizes="(max-width: 899px) 100vw, 52vw" quality={76} />
            </div>
            <figcaption className={styles.credit}>
              <span className={styles.creditName}>{t('team.emrah.name')}</span>
              <span className={styles.creditRole}>{t('team.emrah.role')}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* --- The team -------------------------------------------------------- */}
      <section className={`${styles.artists} section--dark on-dark`} aria-labelledby="artists-title">
        <div className="shell">
          <header className={styles.artistsHead}>
            <span className="eyebrow" data-reveal>
              {t('team.eyebrow')}
            </span>
            <Headline
              id="artists-title"
              className={styles.artistsTitle}
              lines={t.raw('team.titleLines') as string[]}
              accent={t('team.titleAccent')}
            />
          </header>

          <ul className={styles.roster}>
            {team.map(({ key }) => {
              const name = t(`team.${key}.name`);
              const role = t(`team.${key}.role`);
              const portrait = portraits[key];
              return (
                <li className={styles.card} key={key}>
                  <figure className={styles.cardFigure} data-reveal-media>
                    <div className={`media ${styles.cardMedia}`}>
                      {portrait ? (
                        <Image
                          src={portrait}
                          alt={t('team.portraitAlt', { name, role })}
                          sizes="(max-width: 436px) 44vw, (max-width: 1099px) 12rem, 16vw"
                          quality={72}
                        />
                      ) : (
                        <span className={styles.monogram} aria-hidden="true">
                          {name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                  </figure>
                  <p className={styles.cardName}>{name}</p>
                  <p className={styles.cardRole}>{role}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
