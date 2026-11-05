'use client';

import { useLocale, useTranslations } from 'next-intl';

import { bookingStore, estimate, useBooking } from '@/lib/booking-store';
import { SERVICE_GROUPS, serviceById } from '@/lib/services';
import { GROUP_PAGE, servicePage } from '@/lib/service-pages';
import { Link } from '@/i18n/navigation';
import { formatTL, priceLabel, team } from '@/lib/site';
import styles from './PriceMenu.module.css';

const staffName = (key: string) => team.find((m) => m.key === key)?.name ?? key;

/** One selectable price row. Shared by the full list and each service page's own table. */
function ServiceRow({ id }: { id: string }) {
  const t = useTranslations('menu');
  const tb = useTranslations('booking');
  const locale = useLocale();
  const { selected } = useBooking();
  const s = serviceById.get(id);
  if (!s) return null;
  const on = selected.includes(s.id);
  const name = locale === 'tr' ? s.tr : s.en;
  return (
    <li className={styles.row} data-on={on}>
      <div className={styles.rowMain}>
        <span className={styles.rowName}>
          {name}
          {s.signature && <span className={styles.badge}>{tb('signature')}</span>}
        </span>
        <span className={styles.rowStaff}>{s.staff.map(staffName).join(' · ')}</span>
      </div>
      <span className={styles.leader} aria-hidden="true" />
      <span className={styles.rowPrice}>{priceLabel(s.price, locale, tb('onRequest'))}</span>
      <button
        type="button"
        className={styles.add}
        aria-pressed={on}
        aria-label={on ? tb('remove', { service: name }) : t('addLabel', { service: name })}
        onClick={() => bookingStore.toggle(s.id)}
      >
        <span aria-hidden="true">{on ? '✓' : '+'}</span>
      </button>
    </li>
  );
}

/** The bar that rises once something is selected: count, estimate, continue. */
function SelectionBar() {
  const t = useTranslations('menu');
  const tb = useTranslations('booking');
  const locale = useLocale();
  const { selected } = useBooking();
  const est = estimate(selected);
  const tl = (n: number) => `${formatTL(n, locale)} ₺`;
  const total = est.min === 0 ? tb('estimate.onRequest') : est.min === est.max ? tl(est.min) : `${tl(est.min)} – ${tl(est.max)}`;

  return (
    <div className={styles.bar} data-visible={selected.length > 0} aria-hidden={selected.length === 0}>
      <div className={styles.barInner}>
        <div className={styles.barText} aria-live="polite">
          <span className={styles.barCount}>{tb('count', { count: selected.length })}</span>
          <span className={styles.barTotal}>{total}</span>
        </div>
        <button type="button" className={styles.clear} onClick={() => bookingStore.clear()} tabIndex={selected.length ? 0 : -1}>
          {t('clear')}
        </button>
        <button type="button" className="btn" data-book-open data-book-step="summary" tabIndex={selected.length ? 0 : -1}>
          {t('continue')}
        </button>
      </div>
    </div>
  );
}

/** A service page's price table: only that page's services, the same rows and bar. */
export function ServicePrices({ ids }: { ids: readonly string[] }) {
  return (
    <>
      <ul className={styles.rows}>
        {ids.map((id) => (
          <ServiceRow key={id} id={id} />
        ))}
      </ul>
      <SelectionBar />
    </>
  );
}

/**
 * The whole menu, every row selectable. The selection is the same one the
 * booking panel reads, so "Randevuya devam" opens the panel on its summary.
 * Each group's heading links to its service page, where the same prices sit
 * next to what the service is.
 */
export function PriceMenu() {
  const t = useTranslations('menu');

  return (
    <>
      <nav className={styles.jump} aria-label={t('jump')}>
        {SERVICE_GROUPS.map((g) => (
          <a key={g.key} className={styles.jumpLink} href={`#${g.key}`}>
            {t(`groups.${g.key}.title`)}
          </a>
        ))}
      </nav>

      <div className={styles.groups}>
        {SERVICE_GROUPS.map((g) => (
          <section key={g.key} id={g.key} className={styles.group} aria-labelledby={`${g.key}-title`}>
            <header className={styles.groupHead}>
              <h2 id={`${g.key}-title`} className="display display--m">
                {t(`groups.${g.key}.title`)}
              </h2>
              <p className={styles.groupNote}>{t(`groups.${g.key}.note`)}</p>
              <Link className={`link-arrow ${styles.groupLink}`} href={servicePage(GROUP_PAGE[g.key]).route}>
                <span>{t('groupPage')}</span>
                <span className="link-arrow__line" aria-hidden="true" />
              </Link>
            </header>

            <ul className={styles.rows}>
              {g.items.map((s) => (
                <ServiceRow key={s.id} id={s.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className={styles.source}>{t('source')}</p>

      <SelectionBar />
    </>
  );
}
