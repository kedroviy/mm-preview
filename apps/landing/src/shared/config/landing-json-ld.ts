import { getGooglePlayUrl } from "@/src/shared/config/constants";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";
import {
  DEFAULT_LOCALE,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { getLandingFaqItems } from "@/src/shared/seo/landing-faq";

const SITE_JSON_LD_LANG: Record<SupportedLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  es: "es-ES",
};

const SITE_JSON_LD_DESC: Record<SupportedLocale, string> = {
  ru: "Совместный выбор фильма (лобби, приглашение) и соло-подбор для одного: подобрать себе кино на вечер. Приложение в Google Play.",
  en: "Pick a film together (lobby, invite) or solo for movie night. App on Google Play.",
  es: "Elige película juntos (sala, invitación) o en solitario para la noche. App en Google Play.",
};

const APP_JSON_LD_DESC: Record<SupportedLocale, string> = {
  ru: "Совместный выбор фильма (лобби, приглашение) и соло-подбор для одного на вечер.",
  en: "Group movie matching (lobby, invite) and solo pick for a night on your own.",
  es: "Elección en grupo (sala, invitación) y modo en solitario para una noche.",
};

/** Сериализованный JSON-LD для главной: WebSite, Organization, SoftwareApplication, FAQPage. */
export function getLandingJsonLdString(
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const siteUrl = getLandingSiteUrl();
  const playUrl = getGooglePlayUrl();
  const inLang = SITE_JSON_LD_LANG[locale];
  const faqItems = getLandingFaqItems(locale);

  const faqMainEntity = faqItems.map((item) => ({
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
      inLanguage: inLang,
      description: SITE_JSON_LD_DESC[locale],
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
      description: APP_JSON_LD_DESC[locale],
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
