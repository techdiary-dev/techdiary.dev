import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      crawlDelay: 10,
      allow: "/",
      disallow: ["/dashboard", "/backdoor"],
    },
    host: "https://www.techdiary.dev",
    sitemap: [
      "https://www.techdiary.dev/sitemaps/articles/sitemap.xml",
      "https://www.techdiary.dev/sitemaps/profiles/sitemap.xml",
    ],
  };
}
