import type { Metadata } from "next";

export type SupportedLocale = "ru" | "en";

export interface MetadataConfig {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    siteName: string;
  };
}

// Метаданные для разных языков
export const metadataByLang: Record<SupportedLocale, MetadataConfig> = {
  ru: {
    title: "Выбор фильмов - Movie Match",
    description:
      "Выберите фильм для просмотра вместе с друзьями. Создайте комнату, пригласите друзей и выберите идеальный фильм для вечера.",
    keywords: [
      "выбор фильмов",
      "кино",
      "фильмы",
      "просмотр фильмов",
      "подбор фильмов",
      "подбор фильмов для просмотра",
      "подбор фильмов для вечера",
      "подбор фильмов для друзей",
      "подбор фильмов для семьи",
      "подбор фильмов для компании",
      "подбор фильмов для семьи",
      "подбор фильмов для семьи",
      "выбор фильма",
      "movie match",
      "кинотеатр",
      "вечер кино",
      "выбор фильма с друзьями",
      "онлайн кино",
      "рекомендации фильмов",
      "популярные фильмы",
      "смотреть фильмы онлайн",
      "выбор кино",
      "кино с друзьями",
    ],
    openGraph: {
      title: "Выбор фильмов - Movie Match",
      description: "Выберите фильм для просмотра вместе с друзьями",
      siteName: "Movie Match",
    },
  },
  en: {
    title: "Movie Selection - Movie Match",
    description:
      "Choose a movie to watch with friends. Create a room, invite friends and pick the perfect movie for the evening.",
    keywords: [
      "movie selection",
      "movies",
      "cinema",
      "watch movies",
      "choose movie",
      "movie match",
      "movie theater",
      "movie night",
      "choose movie with friends",
      "online movies",
      "movie recommendations",
      "popular movies",
      "film selection",
      "watch together",
      "movie picker",
      "group movie selection",
    ],
    openGraph: {
      title: "Movie Selection - Movie Match",
      description: "Choose a movie to watch with friends",
      siteName: "Movie Match",
    },
  },
};

/**
 * Определяет язык из URL или заголовков
 */
export function detectLanguage(
  pathname: string,
  acceptLanguage?: string | null,
): SupportedLocale {
  // Проверяем префикс языка в URL (например, /ru/ или /en/)
  const langMatch = pathname.match(/^\/(ru|en)(\/|$)/);
  if (langMatch) {
    return langMatch[1] as SupportedLocale;
  }

  // Если нет в URL, определяем из Accept-Language заголовка
  if (acceptLanguage) {
    const lowerLang = acceptLanguage.toLowerCase();
    if (lowerLang.includes("ru")) {
      return "ru";
    }
    if (lowerLang.includes("en")) {
      return "en";
    }
  }

  // По умолчанию русский
  return "ru";
}

/**
 * Генерирует метаданные для указанного языка
 */
export function generateMetadataForLang(
  lang: SupportedLocale,
  baseUrl?: string,
): Metadata {
  const meta = metadataByLang[lang] || metadataByLang.ru;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.openGraph.title,
      description: meta.openGraph.description,
      siteName: meta.openGraph.siteName,
      type: "website",
      locale: lang === "ru" ? "ru_RU" : "en_US",
      ...(baseUrl && { url: baseUrl }),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.openGraph.title,
      description: meta.openGraph.description,
    },
    alternates: {
      languages: {
        "ru-RU": "/ru",
        "en-US": "/en",
        "x-default": "/ru",
      },
    },
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
  };
}

/**
 * Получает язык из заголовков Next.js
 * Используется в generateMetadata функции
 */
export async function getLanguageFromHeaders(): Promise<SupportedLocale> {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  // В Next.js 13+ pathname можно получить из headers или использовать дефолтный
  // Для более точного определения можно использовать middleware
  const pathname = "/"; // По умолчанию корневой путь

  return detectLanguage(pathname, acceptLanguage);
}

/**
 * Генерирует метаданные на основе заголовков запроса
 * Используется в layout.tsx для автоматического определения языка
 */
export async function generateMetadataFromHeaders(
  baseUrl?: string,
): Promise<Metadata> {
  const lang = await getLanguageFromHeaders();
  const metadata = generateMetadataForLang(lang, baseUrl);

  return {
    ...metadata,
    icons: {
      icon: "./favicon.ico",
    },
  };
}
