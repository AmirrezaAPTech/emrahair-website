'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { bookingStore, estimate, staffFit, useBooking, type StaffChoice } from '@/lib/booking-store';
import { SERVICE_GROUPS, serviceById, type Service, type ServiceGroupKey } from '@/lib/services';
import { bookingUrl, contact, formatTL, priceLabel, team } from '@/lib/site';
import { gsap } from '@/motion/lib/gsap';
import { prefersReducedMotion } from '@/motion/lib/env';
import { lockScroll } from '@/motion/modules/scroll';
import styles from './BookingPanel.module.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Step = 'services' | 'staff' | 'summary';

/** Fold Turkish letters so "sac" finds "Saç" and "kas" finds "Kaş". */
const fold = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] ?? c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const staffName = (key: string) => team.find((m) => m.key === key)?.name ?? key;

/**
 * The booking flow, as far as the site can carry it.
 *
 *   1  services   chosen here; the booking link carries every one of them
 *   2  staff      Emrah, Serdar or "Fark etmez" — remembered and shown on the
 *                 summary, because Kolay Randevu cannot be told it (see
 *                 `booking` in lib/site.ts); the guest re-picks it there
 *   3  summary    the estimate, then the hand-off
 *   →  date and time are chosen on Kolay Randevu, which owns the calendar
 *
 * Opened by a delegated listener on [data-book-open], so the buttons that
 * trigger it can be server components. [data-book-service="<id>"] adds that
 * service first; [data-book-step="summary"] opens on the summary.
 */
export function BookingPanel() {
  const t = useTranslations('booking');
  const tGroups = useTranslations('menu.groups');
  const locale = useLocale();
  const { selected, staff } = useBooking();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('services');
  const [group, setGroup] = useState<ServiceGroupKey>('color');
  const [query, setQuery] = useState('');

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const name = useCallback((s: Service) => (locale === 'tr' ? s.tr : s.en), [locale]);
  const price = useCallback((s: Service) => priceLabel(s.price, locale, t('onRequest')), [locale, t]);
  const tl8 = (n: number) => `${formatTL(n, locale)} ₺`;

  const fit = useMemo(() => staffFit(selected), [selected]);
  const est = useMemo(() => estimate(selected), [selected]);
  const steps: Step[] = fit.needsChoice ? ['services', 'staff', 'summary'] : ['services', 'summary'];
  const stepIndex = steps.indexOf(step);

  /* --- Opening ------------------------------------------------------------ */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-book-open]');
      if (!trigger) return;
      e.preventDefault();
      opener.current = trigger;
      const service = trigger.dataset.bookService;
      if (service && serviceById.has(service)) bookingStore.add(service);
      const wanted = trigger.dataset.bookStep as Step | undefined;
      const hasSelection = bookingStore.get().selected.length > 0;
      setStep(wanted === 'summary' && hasSelection ? 'summary' : 'services');
      if (service) {
        const g = SERVICE_GROUPS.find((x) => x.items.some((s) => s.id === service));
        if (g) setGroup(g.key);
      }
      setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  /* --- Motion and scroll lock --------------------------------------------- */
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const veil = veilRef.current;
    if (!root || !panel || !veil) return;
    tl.current?.kill();

    if (open) {
      root.hidden = false;
      lockScroll(true);
      if (prefersReducedMotion()) {
        gsap.set(veil, { opacity: 1 });
        gsap.set(panel, { xPercent: 0, x: 0 });
      } else {
        tl.current = gsap
          .timeline()
          .fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
          .fromTo(panel, { xPercent: 100, x: 0 }, { xPercent: 0, x: 0, duration: 0.8, ease: 'expo.out' }, 0);
      }
      panel.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
      return;
    }

    if (root.hidden) return;
    lockScroll(false);
    const finish = () => {
      root.hidden = true;
    };
    if (prefersReducedMotion()) finish();
    else
      tl.current = gsap
        .timeline({ onComplete: finish })
        .to(panel, { xPercent: 100, x: 0, duration: 0.5, ease: 'power3.in' }, 0)
        .to(veil, { opacity: 0, duration: 0.4 }, 0.1);
    opener.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => () => lockScroll(false), []);

  /* --- Keyboard: Escape closes, Tab stays inside -------------------------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Each step starts at its own top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  /* --- Derived lists ------------------------------------------------------- */
  const visible = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return SERVICE_GROUPS.find((g) => g.key === group)?.items ?? [];
    return SERVICE_GROUPS.flatMap((g) => g.items).filter((s) => fold(s.tr).includes(q) || fold(s.en).includes(q));
  }, [group, query]);

  const countIn = (key: ServiceGroupKey) =>
    SERVICE_GROUPS.find((g) => g.key === key)?.items.filter((s) => selected.includes(s.id)).length ?? 0;

  const next = () => setStep(steps[Math.min(stepIndex + 1, steps.length - 1)] ?? 'summary');
  const back = () => setStep(steps[Math.max(stepIndex - 1, 0)] ?? 'services');

  const estimateText =
    est.min === 0
      ? t('estimate.onRequest')
      : est.min === est.max
        ? tl8(est.min)
        : `${tl8(est.min)} – ${tl8(est.max)}`;

  const staffOptions: { key: StaffChoice; title: string; note: string; gaps: Service[] }[] = [
    { key: 'emrah', title: staffName('emrah'), note: t('staff.emrah'), gaps: fit.emrah },
    { key: 'serdar', title: staffName('serdar'), note: t('staff.serdar'), gaps: fit.serdar },
    { key: 'any', title: t('staff.anyTitle'), note: t('staff.any'), gaps: [] },
  ];

  const chosenStaffLabel =
    staff === 'any' ? t('staff.anyTitle') : (team.find((m) => m.key === staff)?.krLabel ?? staffName(staff));

  return (
    <div className={styles.book} ref={rootRef} hidden>
      <div className={styles.veil} ref={veilRef} onClick={close} aria-hidden="true" />

      <div
        className={`${styles.panel} on-dark`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        {/* --- Head ------------------------------------------------------- */}
        <div className={styles.head}>
          <div>
            <span className="eyebrow">{t('eyebrow')}</span>
            <h2 id="booking-title" className={`display display--s ${styles.title}`}>
              {t(`titles.${step}`)}
            </h2>
          </div>
          <button className={styles.close} type="button" onClick={close} aria-label={t('close')} data-autofocus>
            <span className={styles.closeMark} aria-hidden="true" />
          </button>
        </div>

        <ol className={styles.steps} aria-label={t('progress')}>
          {steps.map((s, i) => (
            <li key={s} data-state={i < stepIndex ? 'done' : i === stepIndex ? 'current' : 'todo'}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{t(`stepNames.${s}`)}</span>
            </li>
          ))}
          <li data-state="external">
            <span className={styles.stepNum}>{steps.length + 1}</span>
            <span>{t('stepNames.calendar')}</span>
          </li>
        </ol>

        {/* --- Body ------------------------------------------------------- */}
        <div className={styles.scroll} ref={scrollRef}>
          {step === 'services' && (
            <>
              <label className={styles.search}>
                <span className="visually-hidden">{t('search')}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                />
              </label>

              {!query && (
                <div className={styles.tabs} role="tablist" aria-label={t('groups')}>
                  {SERVICE_GROUPS.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      role="tab"
                      aria-selected={group === g.key}
                      className={styles.tab}
                      onClick={() => setGroup(g.key)}
                    >
                      {tGroups(`${g.key}.title`)}
                      {countIn(g.key) > 0 && <span className={styles.tabCount}>{countIn(g.key)}</span>}
                    </button>
                  ))}
                </div>
              )}

              <ul className={styles.list}>
                {visible.map((s) => {
                  const on = selected.includes(s.id);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={styles.row}
                        aria-pressed={on}
                        onClick={() => bookingStore.toggle(s.id)}
                      >
                        <span className={styles.check} aria-hidden="true" />
                        <span className={styles.rowMain}>
                          <span className={styles.rowName}>
                            {name(s)}
                            {s.signature && <span className={styles.badge}>{t('signature')}</span>}
                          </span>
                          <span className={styles.rowStaff}>{s.staff.map(staffName).join(' · ')}</span>
                        </span>
                        <span className={styles.rowPrice}>{price(s)}</span>
                      </button>
                    </li>
                  );
                })}
                {visible.length === 0 && <li className={styles.empty}>{t('noResults')}</li>}
              </ul>

              <p className={styles.fine}>{t('priceNote')}</p>
            </>
          )}

          {step === 'staff' && (
            <>
              <p className={styles.lede}>{t('staff.lede')}</p>
              <div className={styles.staffGrid} role="radiogroup" aria-label={t('stepNames.staff')}>
                {staffOptions.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={staff === o.key}
                    className={styles.staffCard}
                    onClick={() => bookingStore.setStaff(o.key)}
                  >
                    <span className={styles.staffMark} aria-hidden="true">
                      {o.key === 'any' ? '∗' : o.title.slice(0, 1)}
                    </span>
                    <span className={styles.staffTitle}>{o.title}</span>
                    <span className={styles.staffNote}>{o.note}</span>
                    {o.gaps.length > 0 && (
                      <span className={styles.staffGap}>
                        {t('staff.gap', { services: o.gaps.map(name).join(', ') })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className={styles.fine}>{t('staff.why')}</p>
            </>
          )}

          {step === 'summary' && (
            <>
              <ul className={styles.summary}>
                {selected.map((id) => {
                  const s = serviceById.get(id);
                  if (!s) return null;
                  return (
                    <li key={id} className={styles.summaryRow}>
                      <span className={styles.rowName}>{name(s)}</span>
                      <span className={styles.rowPrice}>{price(s)}</span>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => bookingStore.toggle(id)}
                        aria-label={t('remove', { service: name(s) })}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.total}>
                <span className="eyebrow eyebrow--muted">{t('estimate.label')}</span>
                <span className={styles.totalValue}>{estimateText}</span>
                {est.unpriced > 0 && <span className={styles.fine}>{t('estimate.unpriced', { count: est.unpriced })}</span>}
              </div>

              <div className={styles.handoff}>
                <span className="eyebrow">{t('handoff.eyebrow')}</span>
                <ol className={styles.handoffSteps}>
                  {fit.needsChoice && (
                    <li>
                      {staff === 'any'
                        ? t('handoff.staffAny')
                        : t.rich('handoff.staffPick', {
                            name: chosenStaffLabel,
                            b: (c) => <strong>{c}</strong>,
                          })}
                    </li>
                  )}
                  <li>{t('handoff.calendar')}</li>
                  <li>{t('handoff.confirm')}</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* --- Foot: the running selection and the way forward -------------- */}
        <div className={styles.foot}>
          <div className={styles.footSummary} aria-live="polite">
            <span className={styles.footCount}>{t('count', { count: selected.length })}</span>
            {selected.length > 0 && <span className={styles.footTotal}>{estimateText}</span>}
          </div>

          <div className={styles.footActions}>
            {stepIndex > 0 && (
              <button type="button" className={styles.backBtn} onClick={back}>
                {t('back')}
              </button>
            )}

            {step !== 'summary' ? (
              <button type="button" className="btn" onClick={next} disabled={selected.length === 0}>
                {t('continue')}
              </button>
            ) : (
              <a className="btn" href={bookingUrl(selected)} rel="noopener">
                {t('handoff.cta')}
              </a>
            )}
          </div>

          {step === 'summary' && (
            <a className={styles.alt} href={contact.whatsapp} target="_blank" rel="noreferrer noopener">
              {t('whatsapp')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
