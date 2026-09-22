import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: `${SITE_URL}`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE_URL}/flights`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/routes`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  return routes.map((r) => ({
    ...r,
    lastModified: new Date(),
  }));
}
