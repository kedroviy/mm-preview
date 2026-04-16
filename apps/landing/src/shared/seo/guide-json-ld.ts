import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import {
  DEFAULT_LOCALE,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import type { LongTailGuide } from "@/src/shared/seo/long-tail-guides-types";

const BREADCRUMB: Record<
  SupportedLocale,
  { home: string; guides: string }
> = {
  ru: { home: "Главная", guides: "Гайды" },
  en: { home: "Home", guides: "Guides" },
  es: { home: "Inicio", guides: "Guías" },
};

const JSON_LD_LANG: Record<SupportedLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  es: "es-ES",
};

/** Article + хлебные крошки для страниц /guides/[slug] (SSG). */
export function getGuideJsonLdString(
  guide: LongTailGuide,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const siteUrl = getLandingSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/guides/${guide.slug}`;
  const bc = BREADCRUMB[locale];

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: bc.home,
          item: `${siteUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: bc.guides,
          item: `${siteUrl}/${locale}/guides`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.h1,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.h1,
      description: guide.metaDescription,
      inLanguage: JSON_LD_LANG[locale],
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
      author: {
        "@type": "Organization",
        name: "Movie Match",
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Movie Match",
        url: siteUrl,
      },
    },
  ];

  return JSON.stringify(graph);
}
