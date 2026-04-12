import type { MetadataRoute } from "next";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getLandingSiteUrl();
  const lastModified = new Date();

  const guides = LONG_TAIL_GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/guides`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...guides,
  ];
}
