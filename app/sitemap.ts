import type { MetadataRoute } from 'next';

import { industries } from '@/lib/content/industries';
import { articles } from '@/lib/content/resources';
import { services } from '@/lib/content/services';
import { siteConfig } from '@/lib/content/site';

const staticRoutes = [
  '',
  '/services',
  '/pricing',
  '/how-it-works',
  '/who-we-help',
  '/about',
  '/faq',
  '/resources',
  '/contact',
  '/get-started',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/disclaimer',
  '/accessibility',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.domain}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteConfig.domain}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const industryRoutes: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${siteConfig.domain}/industries/${industry.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.domain}/resources/${article.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...routes, ...serviceRoutes, ...industryRoutes, ...articleRoutes];
}
