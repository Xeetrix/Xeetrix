import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/os/'],
      },
    ],
    sitemap: `${siteConfig.domain}/sitemap.xml`,
  };
}
