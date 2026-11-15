import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: `${SITE_URL}`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${SITE_URL}/investors`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/mart`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/travels`, changeFrequency: "daily" as const, priority: 0.9 },
  ];

  return routes.map((r) => ({
    ...r,
    lastModified: new Date(),
  }));
}
