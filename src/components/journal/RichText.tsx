import { Fragment } from 'react';

import { Link } from '@/i18n/navigation';
import type { RouteKey } from '@/i18n/routing';
import { serviceById } from '@/lib/services';
import { priceLabel } from '@/lib/site';

/**
 * One paragraph of journal or FAQ copy. Two inline forms only:
 *   [anchor](/route-key)  an internal link, resolved to this locale's URL
 *   [[service-id]]        the live price from services.ts
 */
export function fillPrices(text: string, locale: string, onRequest: string) {
  return text.replace(/\[\[([\w-]+)\]\]/g, (_, id: string) => priceLabel(serviceById.get(id)?.price ?? null, locale, onRequest));
}

export function RichText({ text, locale, onRequest, linkClass }: { text: string; locale: string; onRequest: string; linkClass?: string }) {
  const filled = fillPrices(text, locale, onRequest);
  const parts = filled.split(/(\[[^\]]+\]\(\/[^)]*\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\((\/[^)]*)\)$/);
        if (!m) return <Fragment key={i}>{part}</Fragment>;
        return (
          <Link key={i} href={m[2] as RouteKey} className={linkClass}>
            {m[1]}
          </Link>
        );
      })}
    </>
  );
}

/** The same copy as plain text, for JSON-LD and meta: links become their anchor text. */
export const plain = (text: string, locale: string, onRequest: string) =>
  fillPrices(text, locale, onRequest).replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, '$1');
