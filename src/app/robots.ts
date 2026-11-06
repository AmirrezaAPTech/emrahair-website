import type { MetadataRoute } from 'next';

import { site, indexable } from '@/lib/site';

/**
 * Everything is public. The AI crawlers are named so the choice is explicit:
 * a salon wants to be the answer when someone asks an assistant for a
 * balayage salon in Bahçeşehir.
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  /* Not on the salon's domain yet: no sitemap to advertise. See `indexable`. */
  if (!indexable) return { rules: [{ userAgent: '*', allow: '/' }] };
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
