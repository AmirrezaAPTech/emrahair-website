import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/** Page copy is one file per page (src/i18n/pages/<locale>/<key>.json), merged under `pages`. */
const PAGE_FILES = [
  'balyaj', 'sac-boyama', 'sac-kesimi', 'keratin', 'gelin-saci', 'manikur-pedikur', 'kas-agda', 'emrah-cabkur', 'iletisim',
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const base = (await import(`./messages/${locale}.json`)).default;
  const pages = Object.fromEntries(
    await Promise.all(PAGE_FILES.map(async (key) => [key, (await import(`./pages/${locale}/${key}.json`)).default])),
  );

  return { locale, messages: { ...base, pages } };
});
