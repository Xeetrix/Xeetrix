import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const disallowed = ["/admin", "/mart/admin", "/api"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/mart", "/mart/p/", "/travels", "/investors", "/llms.txt", "/llms-full.txt"],
        disallow: disallowed,
      },
      {
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "Bingbot",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Applebot-Extended",
        ],
        allow: ["/", "/mart", "/mart/p/", "/travels", "/investors", "/llms.txt", "/llms-full.txt"],
        disallow: disallowed,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
