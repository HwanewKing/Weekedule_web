import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { guideArticles } from "@/lib/siteContent";

const staticRoutes = [
  "",
  "/about",
  "/contact",
  "/editorial-policy",
  "/guides",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = staticRoutes.map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const guides = guideArticles.map((article) => ({
    url: absoluteUrl(`/guides/${article.slug}`),
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [...routes, ...guides];
}
