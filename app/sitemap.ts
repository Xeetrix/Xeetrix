import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { fetchMartPublicFromScript } from "@/lib/martServer";
import { buildMartProductUrl, normalizeProductRecord } from "@/lib/martApi";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/mart`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/travels`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/investors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const res = await fetchMartPublicFromScript();
    const rawProducts = res?.data?.products;
    if (!Array.isArray(rawProducts)) {
      return staticRoutes;
    }

    const activeProducts = rawProducts
      .map((item) => normalizeProductRecord(item as Record<string, unknown>))
      .filter((p) => p.active);

    const productRoutes: MetadataRoute.Sitemap = activeProducts.map((product) => {
      const updatedDate = product.createdAt ? new Date(product.createdAt) : now;
      const validDate = Number.isNaN(updatedDate.getTime()) ? now : updatedDate;
      return {
        url: `${SITE_URL}${buildMartProductUrl(product)}`,
        lastModified: validDate,
        changeFrequency: "daily" as const,
        priority: product.featured ? 0.9 : 0.85,
      };
    });

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
