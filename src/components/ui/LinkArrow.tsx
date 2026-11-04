import type { ReactNode } from 'react';

interface CommonProps {
  children: ReactNode;
  className?: string;
}

/** The signature link: a label, a rule, and a small serif arrowhead. */
export function ArrowLink({
  href,
  external,
  children,
  className,
}: CommonProps & { href: string; external?: boolean }) {
  return (
    <a
      className={['link-arrow', className].filter(Boolean).join(' ')}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      data-reveal
    >
      <span>{children}</span>
      <span className="link-arrow__line" aria-hidden="true" />
    </a>
  );
}

/**
 * The same mark as a button. Used for anything that opens the booking panel,
 * which is an action rather than a destination.
 */
export function ArrowButton({
  children,
  className,
  label,
}: CommonProps & { label?: string }) {
  return (
    <button
      type="button"
      className={['link-arrow', className].filter(Boolean).join(' ')}
      data-book-open
      aria-label={label}
      data-reveal
    >
      <span>{children}</span>
      <span className="link-arrow__line" aria-hidden="true" />
    </button>
  );
}
