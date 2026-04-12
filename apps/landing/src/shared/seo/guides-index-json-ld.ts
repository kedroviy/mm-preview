import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";

/** JSON-LD для индекса гайдов: ItemList со ссылками на материалы. */
export function getGuidesIndexJsonLdString(): string {
  const siteUrl = getLandingSiteUrl();
  const listUrl = `${siteUrl}/guides`;

  const itemListElement = LONG_TAIL_GUIDES.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: g.h1,
    item: `${siteUrl}/guides/${g.slug}`,
  }));

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${listUrl}#webpage`,
      name: "Гайды Movie Match",
      description:
        "Материалы о совместном выборе фильма, соло-подборе, лобби и Google Play.",
      url: listUrl,
      isPartOf: { "@id": `${siteUrl}/#website` },
      inLanguage: "ru-RU",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Гайды по Movie Match",
      numberOfItems: LONG_TAIL_GUIDES.length,
      itemListElement,
    },
  ];

  return JSON.stringify(graph);
}
