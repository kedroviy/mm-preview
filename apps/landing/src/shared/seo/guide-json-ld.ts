import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import type { LongTailGuide } from "@/src/shared/seo/long-tail-guides";

/** Article + хлебные крошки для страниц /guides/[slug] (SSG). */
export function getGuideJsonLdString(guide: LongTailGuide): string {
  const siteUrl = getLandingSiteUrl();
  const pageUrl = `${siteUrl}/guides/${guide.slug}`;

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Гайды",
          item: `${siteUrl}/guides`,
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
      inLanguage: "ru-RU",
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
