import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Locale negotiation. German owns the bare paths, so `/` serves German and
 * only `/en` and `/ru` carry a prefix.
 *
 * Next 16 renamed this file convention from `middleware` to `proxy`; the
 * export shape is unchanged, so next-intl's factory drops straight in.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except Next internals, the API surface, and anything with a
  // file extension (fonts, robots.txt, images).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
