import { Link } from '@/i18n/navigation';
import type { RouteKey } from '@/i18n/routing';
import styles from './Breadcrumb.module.css';

/** The visible half of the BreadcrumbList: same names, same order. The last item is this page. */
export function Breadcrumb({ items, label }: { items: { name: string; route: RouteKey }[]; label: string }) {
  return (
    <nav className={styles.crumbs} aria-label={label} data-hero-eyebrow>
      <ol>
        {items.map((it, i) => (
          <li key={it.route}>
            {i < items.length - 1 ? (
              <Link href={it.route}>{it.name}</Link>
            ) : (
              <span aria-current="page">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
