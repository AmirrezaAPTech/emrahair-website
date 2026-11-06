import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A verification build can run beside `next dev`: NEXT_DIST_DIR=.next-build npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',
  turbopack: { root: import.meta.dirname },

  images: {
    // Warm, grainy salon photography holds up far better in AVIF than WebP.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1536, 1920],
    imageSizes: [256, 384, 512],
    // Next 16 only serves qualities declared here; these are the ones the
    // sections ask for.
    qualities: [62, 68, 72, 76],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  async headers() {
    /* Same rule as `indexable` in lib/site.ts: noindex everything (pages,
       images, sitemap, llms.txt) until the salon's own domain is set. */
    const own = process.env.NEXT_PUBLIC_SITE_URL;
    const indexable = Boolean(own) && !/\.vercel\.app\/?$/.test(own ?? '');
    return [
      ...(indexable ? [] : [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]),
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
