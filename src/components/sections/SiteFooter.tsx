import { getLocale, getTranslations } from 'next-intl/server';

import { contact, hours, booking } from '@/lib/site';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/ui/Wordmark';
import styles from './SiteFooter.module.css';

export async function SiteFooter({ onHome = true }: { onHome?: boolean } = {}) {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tSvc = await getTranslations('menu.groups');
  const tHours = await getTranslations('hours');
  const locale = await getLocale();
  const year = new Date().getFullYear();
  const homePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const sectionHref = (id: string) => (onHome ? `#${id}` : `${homePath}/#${id}`);

  const groups = ['color', 'cut', 'care', 'nails', 'brows', 'wax'] as const;

  return (
    <footer className={`${styles.foot} on-light`} id="contact">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href={sectionHref('top')} aria-label={tNav('toTop')}>
              <Wordmark size="md" stacked sub="Bahçeşehir · İstanbul" />
            </a>
            <a className={styles.social} href={contact.instagram} target="_blank" rel="noreferrer noopener">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span>{contact.instagramHandle}</span>
            </a>
          </div>

          <nav className={styles.cols} aria-label={tNav('footer')}>
            <div className={styles.col}>
              <h2 className="eyebrow eyebrow--muted">{t('services')}</h2>
              <ul className={styles.list}>
                {groups.map((g) => (
                  <li key={g}>
                    <Link className={styles.link} href={{ pathname: '/hizmetler', hash: g }}>
                      {tSvc(`${g}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.col}>
              <h2 className="eyebrow eyebrow--muted">{t('hours')}</h2>
              <ul className={styles.list}>
                {hours.map((h) => (
                  <li key={h.day} className={styles.hoursRow}>
                    <span>{tHours(h.day)}</span>
                    <span>{h.open ? `${h.open}–${h.close}` : tHours('closed')}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.col}>
              <h2 className="eyebrow eyebrow--muted">{t('contact')}</h2>
              <address className={styles.list}>
                <a className={styles.link} href={contact.mapsUrl} target="_blank" rel="noreferrer noopener">
                  {contact.district}
                  <br />
                  {contact.street}
                  <br />
                  {contact.postal} {contact.city}
                </a>
                <a className={styles.link} href={contact.phoneHref}>
                  {contact.phone}
                </a>
                <a className={styles.link} href={contact.whatsapp} target="_blank" rel="noreferrer noopener">
                  {t('whatsapp')} · {contact.mobile}
                </a>
                <button className={styles.link} type="button" data-book-open>
                  {t('bookAppointment')}
                </button>
              </address>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>{t('rights', { year })}</p>
          <ul className={styles.legalLinks}>
            <li>
              <a className={styles.link} href={booking.salonPage} target="_blank" rel="noreferrer noopener">
                {t('kolayRandevu')}
              </a>
            </li>
            <li>
              <a className={styles.link} href={contact.mapsUrl} target="_blank" rel="noreferrer noopener">
                {t('directions')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.signature} aria-hidden="true">
        <span>Emrahair</span>
      </div>
    </footer>
  );
}
