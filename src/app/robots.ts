import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/marketplace',
          '/marketplace/',
          '/categorias/',
          '/como-funciona',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/settings/',
          '/chat/',
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
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/settings/', '/chat/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
