'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing, localeLabel, localeShort, type Locale, type RouteKey } from '@/i18n/routing';
import { SECTIONS, contact, hours } from '@/lib/site';
import { HEADER_NAV, MENU_PAGES } from '@/lib/nav';
import { Wordmark } from '@/components/ui/Wordmark';
import { gsap } from '@/motion/lib/gsap';
import { prefersReducedMotion, qsa } from '@/motion/lib/env';
import { lockScroll } from '@/motion/modules/scroll';
import styles from './SiteNav.module.css';

/** Everything Tab can land on inside the drawer. Same list as BookingPanel's. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * What the language switch should offer instead of this page.
 *
 * A single route name sends every language to that route — the Journal index
 * and its paginated pages use '/blog', which each locale serves under its own
 * URL. The per-locale map is for a post: each language's entry names that
 * language's OWN slug of the same article, so the switch lands on the
 * translation rather than on the index. A locale missing from the map falls
 * back to '/blog' — its Journal exists even when a translation does not.
 */
export type LanguageTarget = RouteKey;

export function SiteNav({
  languageHref,
}: {
  /**
   * Where the language switch should point instead of at this page.
   *
   * ┌──────────────────────────────────────────────────────────────────────┐
   * │  ONLY THE JOURNAL NEEDS THIS, BECAUSE ITS SLUGS ARE PER-ARTICLE.     │
   * └──────────────────────────────────────────────────────────────────────┘
   *
   * Every other page on this site is one route in three languages, so
   * switching language means the same page in another one and `usePathname`
   * resolves it. A post's counterparts are three different slugs of one
   * article — /blog/blondiertes-haar-pflegen is /en/blog/caring-for-bleached-
   * hair — and only the translation map knows the pairing, so the post page
   * passes it in. See LanguageTarget above.
   */
  languageHref?: LanguageTarget;
} = {}) {
  const t = useTranslations('nav');
  const tHours = useTranslations('hours');
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  // --- Header state on scroll --------------------------------------
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > window.innerHeight * 0.72);

      if (Math.abs(y - last) > 12) {
        // Never retreat over the hero: the header is part of that composition.
        setHidden(y > last && y > window.innerHeight * 0.9);
        last = y;
      }
      if (y <= 0) setHidden(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A menu must never be able to hide the bar it belongs to.
  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  // --- Which section is under the header ---------------------------
  useEffect(() => {
    // Tracking a set rather than the latest event: on the way back up to the
    // hero nothing crosses the band at all, and marking only on intersect
    // leaves whichever section was last seen highlighted forever.
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        setActive(SECTIONS.find((id) => visible.has(id)) ?? null);
      },
      // A band across the middle of the screen: whatever crosses it is what
      // the visitor is reading.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // --- Menu open / close -------------------------------------------
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    // Queried rather than collected into a ref array: the drawer's contents are
    // a label, four links, a button and a footer block, and threading an index
    // through four different maps to keep them in order is how that list gets
    // out of step the next time something is added to it.
    const items = qsa('[data-menu-item]', menu);
    timeline.current?.kill();

    if (open) {
      menu.hidden = false;
      // Made visible synchronously: a timeline's first tick lands on the next
      // frame, and an element that is still visibility:hidden cannot take
      // focus, so the focus call below would be dropped.
      gsap.set(menu, { visibility: 'visible' });
      lockScroll(true);

      if (prefersReducedMotion()) {
        gsap.set(menu, { xPercent: 0, x: 0 });
        gsap.set(items, { opacity: 1, x: 0 });
      } else {
        gsap.set(items, { opacity: 0, x: 28 });
        timeline.current = gsap
          .timeline()
          // The panel sweeps in from the right edge and travels left across the
          // screen. Nothing fades in: it arrives as an object.
          //
          // x is zeroed alongside the percentage. GSAP decomposes whatever
          // transform it finds into pixels, so any CSS rest state comes back as
          // a pixel offset underneath the percentage, and animating xPercent to
          // 0 then travels from nowhere to nowhere.
          .fromTo(
            menu,
            { xPercent: 100, x: 0 },
            { xPercent: 0, x: 0, duration: 0.85, ease: 'expo.out' },
            0
          )
          // The contents follow the panel in the same direction rather than
          // riding in on it, which is what keeps this from reading as one flat
          // sheet of decal sliding across.
          .to(items, { opacity: 1, x: 0, duration: 0.8, stagger: 0.055 }, 0.26);
      }

      menu.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
      return;
    }

    // Closing. Skipped entirely on first mount, where the menu was never open.
    if (menu.hidden) return;

    lockScroll(false);
    const finish = () => {
      menu.hidden = true;
      gsap.set(menu, { visibility: 'hidden' });
    };

    // Back out the way it came, so the gesture reads as reversible rather than
    // as two unrelated animations.
    if (prefersReducedMotion()) {
      gsap.set(menu, { xPercent: 100, x: 0 });
      finish();
    } else {
      timeline.current = gsap
        .timeline({ onComplete: finish })
        .to(items, { opacity: 0, duration: 0.25 }, 0)
        .to(menu, { xPercent: 100, x: 0, duration: 0.55, ease: 'power3.in' }, 0.08);
    }

    toggleRef.current?.focus({ preventScroll: true });
  }, [open]);

  // Escape closes, and a menu left open past its own breakpoint is a trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      /* The panel covers the whole screen, so Tab must not walk out of it and
         into the page underneath — which is still in the document and still
         focusable. Same trap as BookingPanel's, and the toggle is included in
         the ring because it is the way out. */
      if (e.key !== 'Tab') return;

      const menu = menuRef.current;
      if (!menu) return;
      const focusable = [
        toggleRef.current,
        ...Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE)),
      ].filter((el): el is HTMLElement => !!el && el.offsetParent !== null);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // The same line the inline nav returns at, in the stylesheet's breakpoints
    // block. A menu left open past its own breakpoint is a trap, and one that
    // closes at a different width than the one that hid the toggle is a
    // different trap eighty pixels wide.
    const wide = window.matchMedia('(min-width: 1181px)');
    const onWide = (e: MediaQueryListEvent) => e.matches && close();

    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, [open, close]);

  // Release the scroll lock if this unmounts while the menu is open.
  useEffect(() => () => lockScroll(false), []);

  const hourRows = hours.map((h) => ({
    days: tHours(h.day),
    time: h.open ? `${h.open}–${h.close}` : tHours('closed'),
  }));

  /* Every section in SECTIONS lives on the landing page, so a bare "#services"
     points at nothing from any other route — it was silently a no-op the moment
     the first subpage shipped. Off the landing page the anchor is qualified with
     the home path, and `usePathname` has already stripped the locale prefix, so
     it has to go back on: German owns the bare path, the other two are prefixed
     (see routing.ts, localePrefix 'as-needed'). */
  const onHome = pathname === '/';
  const homePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const sectionHref = (id: string) => (onHome ? `#${id}` : `${homePath}/#${id}`);

  /* `usePathname` returns the internal route NAME, not the slug — '/blog' on
     /en/blog and '/blog/[slug]' on a post — so the Journal item marks itself
     current across the whole subtree rather than only on the index. */
  const onRoute = (route: RouteKey) => pathname === route;

  return (
    <header
      className={`${styles.nav} on-dark`}
      data-nav
      data-solid={solid}
      data-hidden={hidden}
      data-menu-state={open ? 'open' : 'closed'}
    >
      <div className={styles.bar}>
        <a
          className={styles.brand}
          href={sectionHref('top')}
          aria-label={t('toTop')}
          onClick={close}
        >
          <Wordmark size="sm" sub="Bahçeşehir" />
        </a>

        {/* Five pages. The cast widens the tuple back to NavItem so the
            section branch below stays compilable — the bar is all routes
            today, and the branch is what lets an anchor return without
            touching this file. */}
        <nav className={styles.links} aria-label={t('primary')}>
          <ul className={styles.list}>
            {HEADER_NAV.map((item) =>
              item.kind === 'section' ? (
                <li key={item.id}>
                  <a
                    className={styles.link}
                    href={sectionHref(item.id)}
                    data-active={active === item.id}
                    {...(active === item.id ? { 'aria-current': true } : {})}
                  >
                    {t(item.label)}
                  </a>
                </li>
              ) : (
                <li key={item.route}>
                  {/* A route key, so next-intl resolves this locale's slug.
                      /kontakt used to be an anchor onto the footer; it is a
                      page now, and the footer is not it. */}
                  <Link
                    className={styles.link}
                    href={item.route}
                    data-active={onRoute(item.route)}
                    {...(onRoute(item.route) ? { 'aria-current': 'page' as const } : {})}
                  >
                    {t(item.label)}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LocaleSwitch
            current={locale}
            /* `usePathname` is typed as any route name, including the two the
               Journal added with a dynamic segment in them. Those are exactly
               the pages that pass `languageHref`, so the fallback only ever
               sees a static route — which is what the switch needs, since it
               links the name as a bare string. */
            target={languageHref ?? (pathname as RouteKey)}
            label={t('language')}
            of={t}
          />

          {/* One label at every width it appears at. The pill either says what
              it does or it is not in the bar at all — below 768px it leaves
              (see the stylesheet) and the menu carries booking instead. */}
          <button className={`btn ${styles.book}`} type="button" data-book-open>
            {t('book')}
          </button>

          <button
            ref={toggleRef}
            className={styles.toggle}
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="visually-hidden">{open ? t('closeMenu') : t('openMenu')}</span>
            <span className={styles.bars} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Not a narrowed desktop nav: on a phone and a tablet this is the
          primary way through the site, so it takes the whole screen and gets
          display type and real content. No veil — nothing of the page is left
          showing to dim once the panel has landed. */}
      <div className={`${styles.menu} on-dark grain`} id="nav-menu" ref={menuRef} hidden>
        <div className={styles.menuInner}>
          <span className={`eyebrow ${styles.menuEyebrow}`} data-menu-item>
            {t('menuLabel')}
          </span>

          {/* The same five pages the bar carries, in display type — the
              client's spec: bar and drawer say the same thing everywhere,
              and no landing-page anchors. The index below then holds only
              what these five do not: the service detail pages, the training
              page and the founder. */}
          <ul className={styles.menuList}>
            {HEADER_NAV.map((item, i) => {
              const inner = (
                <>
                  <span className={`numeral ${styles.menuIndex}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={`display display--l ${styles.menuLabel}`}>{t(item.label)}</span>
                  <span className={styles.menuArrow} aria-hidden="true" />
                </>
              );
              return (
                <li className={styles.menuItem} key={item.label} data-menu-item>
                  {item.kind === 'route' ? (
                    <Link className={styles.menuLink} href={item.route} onClick={close} data-active={onRoute(item.route)}>
                      {inner}
                    </Link>
                  ) : (
                    <a className={styles.menuLink} href={sectionHref(item.id)} onClick={close} data-active={active === item.id}>
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {/* --- The index -------------------------------------------------
              Every page the site has, grouped, in the sans at reading size. An
              index, not a second menu: no icons, no chevrons, no accordions,
              nothing that opens. The legal three are not here — they are in the
              footer's bottom rail on every page. See lib/nav.ts. */}
          <nav className={styles.index} aria-label={t('index')} data-menu-item>
            <div className={styles.indexGroup}>
              <h2 className={`eyebrow eyebrow--muted ${styles.indexHeading}`}>{t('menuIndex')}</h2>
              <ul className={styles.indexList}>
                {MENU_PAGES.map((p) => (
                  <li key={p.key}>
                    <Link className={styles.indexLink} href={p.route} onClick={close}>
                      {t(`pages.${p.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* The pill leaves the bar on a phone (see the 767px block in the
              stylesheet) and lands here instead, so booking is still one tap
              from anywhere on the page rather than only from the hero. */}
          <div className={styles.menuBook} data-menu-item>
            <button
              className={`btn ${styles.menuBookBtn}`}
              type="button"
              data-book-open
              onClick={close}
            >
              {t('book')}
            </button>
          </div>

          <div className={styles.menuFoot} data-menu-item>
            {/* The salon publishes no opening hours, so none are stated here.
                See HOURS_VERIFIED in lib/site.ts. */}
            <div className={styles.menuBlock}>
              <span className="eyebrow eyebrow--muted">{tHours('label')}</span>
              <dl className={styles.menuHours}>
                {hourRows.map((row) => (
                  <div className={styles.menuHoursRow} key={row.days}>
                    <dt>{row.days}</dt>
                    <dd>{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.menuBlock}>
              <span className="eyebrow eyebrow--muted">{t('contact')}</span>
              <address className={styles.menuContact}>
                <a href={contact.mapsUrl} target="_blank" rel="noreferrer noopener">
                  {`${contact.district}, ${contact.street}`}
                </a>
                <a href={contact.phoneHref}>{contact.phone}</a>
                <a href={contact.whatsapp} target="_blank" rel="noreferrer noopener">
                  WhatsApp · {contact.mobile}
                </a>
              </address>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * The current locale and a caret. Three codes in a row read as a stray piece
 * of nav; one code that opens is a control, and it stays one control however
 * many languages the site grows to.
 */
function LocaleSwitch({
  current,
  target,
  label,
  of,
}: {
  current: Locale;
  /* A route name every locale shares, or the Journal's per-locale map — see
     LanguageTarget. Typed rather than a string, so a literal slug cannot be
     passed here by mistake. */
  target: LanguageTarget;
  label: string;
  of: (key: 'languageOf', values: Record<string, string>) => string;
}) {
  /* The map's fallback is the Journal index: a locale with no entry has no
     translation of this article, but its Journal always exists. */
  const hrefFor = (_l: Locale) => target;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.locales} ref={root}>
      <button
        className={styles.localeTrigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{localeShort[current]}</span>
        <svg
          className={styles.caret}
          data-open={open}
          viewBox="0 0 10 6"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M1 1.25 5 4.75 9 1.25" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>

      <ul className={styles.localeMenu} hidden={!open}>
        {routing.locales.map((l) => (
          <li key={l}>
            <Link
              className={styles.locale}
              href={hrefFor(l)}
              locale={l}
              hrefLang={l}
              /* Read by AnalyticsRuntime's delegated listener for the
                 `language_switch` event. It marks the switch explicitly rather
                 than letting the listener infer one from a locale prefix in an
                 href, which every internal link on /en and /ru also has. */
              data-locale-switch={l}
              data-active={l === current}
              aria-current={l === current ? 'true' : undefined}
              aria-label={of('languageOf', { language: localeLabel[l] })}
              onClick={() => setOpen(false)}
            >
              {localeShort[l]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
