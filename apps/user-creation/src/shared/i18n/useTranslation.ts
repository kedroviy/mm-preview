"use client";

import { useMemo } from "react";
import { type Locale, type TranslationKey, translations } from "./locales";

function detectLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const browserLang = navigator.language || navigator.languages?.[0] || "en";
  const langCode = browserLang.split("-")[0]?.toLowerCase();

  return langCode === "ru" ? "ru" : "en";
}

export function useTranslation() {
  const locale = useMemo(() => detectLocale(), []);
  const dictionary = translations[locale];

  return {
    locale,
    t: (key: TranslationKey): string => dictionary[key] || key,
  };
}
