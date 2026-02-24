import type { MetadataRoute } from 'next';

// =============================================================================
// Robots.txt Generator for EventSwap
// Next.js 14 convention: export default function robots()
// =============================================================================

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/chat/',
          '/admin/',
          '/wallet/',
          '/my-listings/',
          '/purchases/',
          '/sales/',
          '/sell/',
          '/history/',
          '/notifications/',
          '/callback',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
