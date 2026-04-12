import { getGooglePlayUrl } from "@/src/shared/config/constants";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import { LANDING_FAQ_ITEMS } from "@/src/shared/seo/landing-faq";

/** Сериализованный JSON-LD для главной: WebSite, Organization, SoftwareApplication, FAQPage. */
export function getLandingJsonLdString(): string {
  const siteUrl = getLandingSiteUrl();
  const playUrl = getGooglePlayUrl();

  const faqMainEntity = LANDING_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Movie Match",
      url: siteUrl,
      inLanguage: "ru-RU",
      description:
        "Совместный выбор фильма (лобби, приглашение) и соло-подбор для одного: подобрать себе кино на вечер. Приложение в Google Play.",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Movie Match",
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Movie Match",
      description:
        "Совместный выбор фильма (лобби, приглашение) и соло-подбор для одного на вечер.",
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "ANDROID",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: playUrl,
      },
      downloadUrl: playUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqMainEntity,
    },
  ];

  return JSON.stringify(graph);
}
