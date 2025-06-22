import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://pics.amritkumarchanchal.me/sitemap.xml',
    host: 'https://pics.amritkumarchanchal.me',
  };
}