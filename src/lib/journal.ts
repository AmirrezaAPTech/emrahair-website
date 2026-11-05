import fs from 'node:fs';
import path from 'node:path';

import { routing, STATIC_ROUTES, type Locale, type RouteKey } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { serviceById } from './services';
import { site } from './site';

/**
 * The journal: one JSON file per article per locale in content/journal/<locale>/.
 * Translations are paired by `key`; each locale has its own ASCII slug, so the
 * Turkish post ranks on Turkish words and the English one on English.
 *
 * Read at build time only (every route is static). The checks below fail the
 * build, not the page: a broken link, an unknown price token or an overlong
 * title never reaches Google.
 */
export type PostSection = { heading: string; body: string[]; list?: string[] };

export type Post = {
  key: string;
  slug: string;
  locale: Locale;
  title: string;
  seoTitle: string;
  description: string;
  publishedAt: string;
  updatedAt: string | null;
  tags: string[];
  hero: string | null;
  heroAlt: string;
  lede: string;
  sections: PostSection[];
  faq: { q: string; a: string }[];
  relatedPages: RouteKey[];
};

const ROOT = path.join(process.cwd(), 'content', 'journal');
const LINK = /\[([^\]]+)\]\((\/[^)]*)\)/g;
const TOKEN = /\[\[([\w-]+)\]\]/g;

function check(p: Post, file: string) {
  const fail = (m: string) => {
    throw new Error(`journal: ${file}: ${m}`);
  };
  if (`${p.slug}.json` !== path.basename(file)) fail('slug must equal the filename');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) fail('slug must be ASCII kebab-case');
  if (p.seoTitle.length > 60) fail(`seoTitle is ${p.seoTitle.length} chars (max 60)`);
  if (p.description.length < 120 || p.description.length > 160) fail(`description is ${p.description.length} chars (120–160)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt)) fail('publishedAt must be YYYY-MM-DD');
  for (const r of p.relatedPages) if (!STATIC_ROUTES.includes(r)) fail(`unknown related page ${r}`);
  const text = JSON.stringify([p.lede, p.sections, p.faq]);
  for (const [, , href] of text.matchAll(LINK)) if (!STATIC_ROUTES.includes(href as RouteKey)) fail(`unknown link ${href}`);
  for (const [, id] of text.matchAll(TOKEN)) if (!serviceById.has(id!)) fail(`unknown price token ${id}`);
  if (p.hero && !p.heroAlt) fail('a hero needs heroAlt');
}

let cache: Post[] | null = null;

export function allPosts(): Post[] {
  if (cache) return cache;
  const posts: Post[] = [];
  for (const locale of routing.locales) {
    const dir = path.join(ROOT, locale);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
      const file = path.join(dir, f);
      const p = { ...JSON.parse(fs.readFileSync(file, 'utf8')), locale } as Post;
      check(p, file);
      posts.push(p);
    }
  }
  posts.sort((a, b) => (b.publishedAt + b.key).localeCompare(a.publishedAt + a.key));
  cache = posts;
  return posts;
}

export const postsIn = (locale: Locale) => allPosts().filter((p) => p.locale === locale);

export const postBySlug = (locale: Locale, slug: string) => postsIn(locale).find((p) => p.slug === slug);

/** The same article in every locale that has it. */
export const translationsOf = (key: string) =>
  Object.fromEntries(allPosts().filter((p) => p.key === key).map((p) => [p.locale, p.slug])) as Partial<Record<Locale, string>>;

export const postHref = (slug: string) => ({ pathname: '/blog/[slug]' as const, params: { slug } });

export const postUrl = (locale: Locale, slug: string) => `${site.url}${getPathname({ href: postHref(slug), locale })}`;

/** Posts that hand readers to a given page, for the "from the journal" links on service pages. */
export const postsFor = (locale: Locale, route: RouteKey) => postsIn(locale).filter((p) => p.relatedPages.includes(route));

export const wordCount = (p: Post) =>
  [p.lede, ...p.sections.flatMap((s) => [s.heading, ...s.body, ...(s.list ?? [])]), ...p.faq.flatMap((f) => [f.q, f.a])]
    .join(' ')
    .replace(LINK, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

export const readingMinutes = (p: Post) => Math.max(1, Math.round(wordCount(p) / 200));

export const lastModified = (p: Post) => p.updatedAt ?? p.publishedAt;
