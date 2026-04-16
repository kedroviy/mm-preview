import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/src/shared/config/metadata";

type OpenGraphCopy = {
  homeAlt: string;
  homeTitle: string;
  homeSubtitle: string;
  guidesAlt: string;
  guidesTitle: string;
  guidesSubtitle: string;
  guideLabel: string;
};

const OPENGRAPH_COPY: Record<SupportedLocale, OpenGraphCopy> = {
  ru: {
    homeAlt:
      "Movie Match — совместный и соло-подбор фильма (друзья, пара или один)",
    homeTitle: "Фильм для вечера — без споров",
    homeSubtitle: "Совместно или в соло · друзья, пара, один · Google Play",
    guidesAlt: "Movie Match — гайды: совместный и соло-подбор фильма",
    guidesTitle: "Гайды: фильм вместе или в соло",
    guidesSubtitle: "Лобби, Google Play, длинные запросы — одна витрина материалов",
    guideLabel: "Movie Match · гайд",
  },
  en: {
    homeAlt: "Movie Match — group and solo movie picking (friends, couple, solo)",
    homeTitle: "A film for tonight — no endless debate",
    homeSubtitle: "Together or solo · friends, couple, solo · Google Play",
    guidesAlt: "Movie Match — guides: group and solo movie picking",
    guidesTitle: "Guides: pick a film together or solo",
    guidesSubtitle: "Lobby, Google Play, long-tail topics — one guide hub",
    guideLabel: "Movie Match · guide",
  },
  es: {
    homeAlt:
      "Movie Match — elección de película en grupo y en solitario (amigos, pareja o solo)",
    homeTitle: "Película para esta noche — sin discusiones eternas",
    homeSubtitle:
      "Juntos o en solitario · amigos, pareja, solo · Google Play",
    guidesAlt: "Movie Match — guías: elegir película juntos o en solitario",
    guidesTitle: "Guías: película juntos o en solitario",
    guidesSubtitle:
      "Sala, Google Play y búsquedas long-tail — un solo hub de guías",
    guideLabel: "Movie Match · guía",
  },
};

export function getOpenGraphCopy(locale: SupportedLocale): OpenGraphCopy {
  return OPENGRAPH_COPY[locale];
}

export function parseOgLocale(lang: string): SupportedLocale {
  if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}
