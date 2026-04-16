import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import {
  DEFAULT_LOCALE,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { getGuidesForLocale } from "@/src/shared/seo/long-tail-guides";

const INDEX_PAGE: Record<
  SupportedLocale,
  { name: string; description: string }
> = {
  ru: {
    name: "Гайды Movie Match",
    description:
      "Материалы о совместном выборе фильма, соло-подборе, лобби и Google Play.",
  },
  en: {
    name: "Movie Match guides",
    description:
      "Articles on group movie matching, solo pick, lobby, and Google Play.",
  },
  es: {
    name: "Guías de Movie Match",
    description:
      "Artículos sobre elección en grupo, modo en solitario, sala y Google Play.",
  },
};

const INDEX_LIST_NAME: Record<SupportedLocale, string> = {
  ru: "Гайды по Movie Match",
  en: "Movie Match guides",
  es: "Guías sobre Movie Match",
};

const JSON_LD_LANG: Record<SupportedLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  es: "es-ES",
};

/** JSON-LD для индекса гайдов: ItemList со ссылками на материалы. */
export function getGuidesIndexJsonLdString(
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const siteUrl = getLandingSiteUrl();
  const guides = getGuidesForLocale(locale);
  const listUrl = `${siteUrl}/${locale}/guides`;
  const page = INDEX_PAGE[locale];

  const itemListElement = guides.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: g.h1,
    item: `${siteUrl}/${locale}/guides/${g.slug}`,
  }));

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${listUrl}#webpage`,
      name: page.name,
      description: page.description,
      url: listUrl,
      isPartOf: { "@id": `${siteUrl}/#website` },
      inLanguage: JSON_LD_LANG[locale],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: INDEX_LIST_NAME[locale],
      numberOfItems: guides.length,
      itemListElement,
    },
  ];

  return JSON.stringify(graph);
}
