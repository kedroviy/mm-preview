import type { Metadata } from "next";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";

export type SupportedLocale = "ru" | "en";

export interface MetadataConfig {
  titleDefault: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    siteName: string;
  };
}

function dedupeKeywords(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of list) {
    const t = k.trim();
    if (!t) {
      continue;
    }
    const key = t.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Контент и ключевые фразы для индексации (RU — основной язык сайта). */
export const metadataByLang: Record<SupportedLocale, MetadataConfig> = {
  ru: {
    titleDefault:
      "Movie Match — совместный выбор фильма с друзьями или парой | что посмотреть",
    titleTemplate: "%s · Movie Match",
    description:
      "Movie Match помогает договориться, что посмотреть: лобби, приглашение и совместный подбор фильма без бесконечных споров. Идеи для киновечера, просмотр с компанией или вдвоём — приложение в Google Play (развлечения). Подойдёт, если ищете способ выбрать кино, сериал на вечер или подобрать фильмы на настроение.",
    keywords: dedupeKeywords([
      "что посмотреть",
      "что посмотреть вечером",
      "идеи фильмов",
      "подбор фильма",
      "подбор фильмов",
      "подбор фильмов для просмотра",
      "подбор фильмов на вечер",
      "подбор фильмов с друзьями",
      "подбор фильмов для компании",
      "подбор фильмов для семьи",
      "подбор фильмов для пары",
      "совместный выбор фильма",
      "совместный просмотр",
      "выбор фильма",
      "выбор фильма онлайн",
      "выбор кино",
      "выбор фильмов",
      "кино с друзьями",
      "кино вдвоём",
      "киновечер",
      "вечер кино",
      "просмотр фильмов",
      "смотреть фильмы",
      "фильмы на вечер",
      "рекомендации фильмов",
      "movie match",
      "приложение для выбора фильма",
      "лобби для фильма",
      "Google Play развлечения",
    ]),
    openGraph: {
      title: "Movie Match — выберите фильм вместе, без споров",
      description:
        "Лобби, приглашение и совместный подбор: договоритесь, что посмотреть, за минуты. Доступно в Google Play.",
      siteName: "Movie Match",
    },
  },
  en: {
    titleDefault:
      "Movie Match — pick a movie together with friends or your partner",
    titleTemplate: "%s · Movie Match",
    description:
      "Movie Match helps you decide what to watch: create a lobby, invite your partner or friends, and match on movies without endless debate. Great for movie night, group watch, or date night — available on Google Play (Entertainment).",
    keywords: dedupeKeywords([
      "what to watch",
      "movie night",
      "pick a movie",
      "choose a movie together",
      "movie picker app",
      "watch movies with friends",
      "group movie choice",
      "couple movie app",
      "movie recommendations",
      "find a film to watch",
      "entertainment app",
      "Google Play",
      "movie match",
    ]),
    openGraph: {
      title: "Movie Match — decide what to watch together",
      description:
        "Lobby, invite, and match—stop arguing, start watching. On Google Play.",
      siteName: "Movie Match",
    },
  },
};

/**
 * Определяет язык из URL или заголовка Accept-Language (для будущих сценариев).
 */
export function detectLanguage(
  pathname: string,
  acceptLanguage?: string | null,
): SupportedLocale {
  const langMatch = pathname.match(/^\/(ru|en)(\/|$)/);
  if (langMatch) {
    return langMatch[1] as SupportedLocale;
  }

  if (acceptLanguage) {
    const lowerLang = acceptLanguage.toLowerCase();
    if (lowerLang.includes("ru")) {
      return "ru";
    }
    if (lowerLang.includes("en")) {
      return "en";
    }
  }

  return "ru";
}

function googleSiteVerification(): Metadata["verification"] | undefined {
  const token = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!token) {
    return undefined;
  }
  return { google: token };
}

/**
 * Полные статические метаданные для SSG (без headers()/cookies — иначе страница станет динамической).
 */
export function createLandingMetadata(lang: SupportedLocale): Metadata {
  const siteUrl = getLandingSiteUrl();
  const base = new URL(`${siteUrl}/`);
  const meta = metadataByLang[lang] ?? metadataByLang.ru;
  const verification = googleSiteVerification();

  return {
    metadataBase: base,
    applicationName: "Movie Match",
    title: {
      default: meta.titleDefault,
      template: meta.titleTemplate,
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: "Movie Match", url: siteUrl }],
    creator: "Movie Match",
    publisher: "Movie Match",
    category: "entertainment",
    alternates: {
      canonical: "/",
      languages: {
        "ru-RU": "/",
        "x-default": "/",
      },
    },
    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },
    referrer: "origin-when-cross-origin",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...(verification ? { verification } : {}),
    openGraph: {
      title: meta.openGraph.title,
      description: meta.openGraph.description,
      siteName: meta.openGraph.siteName,
      type: "website",
      locale: lang === "ru" ? "ru_RU" : "en_US",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.openGraph.title,
      description: meta.openGraph.description,
    },
    appleWebApp: {
      capable: true,
      title: meta.titleDefault.slice(0, 64),
      statusBarStyle: "default",
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

/** Метаданные корневого лендинга (русский контент страницы). */
export const rootLandingMetadata: Metadata = createLandingMetadata("ru");
