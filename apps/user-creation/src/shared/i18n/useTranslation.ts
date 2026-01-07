"use client";

import { useMemo } from "react";
import { type Locale, type TranslationKey, translations } from "./locales";

function detectLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const browserLang = navigator.language || navigator.languages?.[0] || "en";
  const langCode = browserLang.split("-")[0].toLowerCase();

  if (langCode === "ru") {
    return "ru";
  }

  return "en";
}

export function useTranslation() {
  const locale = useMemo(() => detectLocale(), []);
  const t = translations[locale];

  return {
    locale,
    t: (key: TranslationKey): string => {
      return t[key] || key;
    },
  };
}
