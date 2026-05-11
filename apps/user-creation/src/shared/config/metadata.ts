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

export const metadataByLang: Record<SupportedLocale, MetadataConfig> = {
  ru: {
    title: "Авторизация - Movie Match",
    description:
      "Войдите в Movie Match или создайте новый аккаунт, чтобы продолжить.",
    keywords: [
      "авторизация",
      "вход",
      "регистрация",
      "movie match",
      "аккаунт movie match",
    ],
    openGraph: {
      title: "Авторизация - Movie Match",
      description: "Вход и регистрация в Movie Match",
      siteName: "Movie Match",
    },
  },
  en: {
    title: "Authentication - Movie Match",
    description: "Log in to Movie Match or create a new account to continue.",
    keywords: [
      "authentication",
      "login",
      "registration",
      "movie match",
      "movie match account",
    ],
    openGraph: {
      title: "Authentication - Movie Match",
      description: "Login and registration in Movie Match",
      siteName: "Movie Match",
    },
  },
};

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

export async function getLanguageFromHeaders(): Promise<SupportedLocale> {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  return detectLanguage("/", acceptLanguage);
}

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
