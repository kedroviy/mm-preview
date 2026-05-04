import type { MetadataRoute } from "next";
import {
  DEFAULT_LOCALE,
  HREFLANG_FOR_LOCALE,
  SUPPORTED_LOCALES,
} from "@/src/shared/config/metadata";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import { getGuidesForLocale } from "@/src/shared/seo/long-tail-guides";

function buildLanguageAlternates(
  byHreflang: Record<string, string>,
): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: {
      ...byHreflang,
      "x-default": byHreflang[HREFLANG_FOR_LOCALE[DEFAULT_LOCALE]],
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getLandingSiteUrl();
  const lastModified = new Date();
  const guidesByLocale = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, getGuidesForLocale(locale)]),
  );

  const localizedGuides = SUPPORTED_LOCALES.flatMap((lang) => {
    const guidesIndexAlternates = buildLanguageAlternates(
      Object.fromEntries(
        SUPPORTED_LOCALES.map((locale) => [
          HREFLANG_FOR_LOCALE[locale],
          `${base}/${locale}/guides`,
        ]),
      ),
    );
    const guidesIndex: MetadataRoute.Sitemap[number] = {
      url: `${base}/${lang}/guides`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: guidesIndexAlternates,
    };
    const guides = guidesByLocale[lang].map((g) => {
      const alternates = buildLanguageAlternates(
        Object.fromEntries(
          SUPPORTED_LOCALES.map((locale) => [
            HREFLANG_FOR_LOCALE[locale],
            `${base}/${locale}/guides/${g.slug}`,
          ]),
        ),
      );
      return {
        url: `${base}/${lang}/guides/${g.slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.75,
        alternates,
      };
    });
    return [guidesIndex, ...guides];
  });

  return [
    ...SUPPORTED_LOCALES.map((lang) => {
      const alternates = buildLanguageAlternates(
        Object.fromEntries(
          SUPPORTED_LOCALES.map((locale) => [
            HREFLANG_FOR_LOCALE[locale],
            `${base}/${locale}`,
          ]),
        ),
      );
      return {
        url: `${base}/${lang}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 1,
        alternates,
      };
    }),
    ...localizedGuides,
  ];
}
