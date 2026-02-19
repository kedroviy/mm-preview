import type { Metadata } from "next";

export type SupportedLocale = "ru" | "en";

export interface MetadataConfig {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    siteName: string;
  };
}

// Метаданные для разных языков (без keywords, так как это приложение под авторизацией)
export const metadataByLang: Record<SupportedLocale, MetadataConfig> = {
  ru: {
    title: "Личный кабинет - Movie Match",
    description:
      "Ваш личный кабинет для управления комнатами, выбора фильмов и взаимодействия с друзьями.",
    openGraph: {
      title: "Личный кабинет - Movie Match",
      description: "Ваш личный кабинет для управления комнатами и выбора фильмов",
      siteName: "Movie Match",
    },
  },
  en: {
    title: "Dashboard - Movie Match",
    description:
      "Your personal dashboard for managing rooms, selecting movies and interacting with friends.",
    openGraph: {
      title: "Dashboard - Movie Match",
      description: "Your personal dashboard for managing rooms and selecting movies",
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
      index: false, // Не индексируем личный кабинет
      follow: false,
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

