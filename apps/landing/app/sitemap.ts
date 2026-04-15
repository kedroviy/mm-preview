import type { MetadataRoute } from "next";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import { SUPPORTED_LOCALES } from "@/src/shared/config/metadata";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getLandingSiteUrl();
  const lastModified = new Date();

  const localizedGuides = SUPPORTED_LOCALES.flatMap((lang) => {
    const guidesIndex: MetadataRoute.Sitemap[number] = {
      url: `${base}/${lang}/guides`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    };
    const guides = LONG_TAIL_GUIDES.map((g) => ({
      url: `${base}/${lang}/guides/${g.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
    return [guidesIndex, ...guides];
  });

  return [
    ...SUPPORTED_LOCALES.map((lang) => ({
      url: `${base}/${lang}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1,
    })),
    ...localizedGuides,
  ];
}
