import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/', '/settings/', '/chat/'],
    },
    sitemap: 'https://eventswap.com/sitemap.xml',
  };
}
