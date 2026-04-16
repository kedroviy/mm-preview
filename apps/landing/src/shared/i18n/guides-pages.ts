import type { SupportedLocale } from "@/src/shared/config/metadata";

type GuidesPagesCopy = {
  metaTitle: string;
  metaDescription: string;
  home: string;
  guides: string;
  indexH1: string;
  indexIntro: string;
  backToHome: string;
  footerCopyright: string;
  articleAllGuides: string;
  articlePlayWeb: string;
  ogTitle: string;
  ogDescription: string;
};

const copy: Record<SupportedLocale, GuidesPagesCopy> = {
  ru: {
    metaTitle: "Гайды | Movie Match",
    metaDescription:
      "Как выбрать фильм вместе или в соло: лобби, приглашение и быстрый сценарий ночи кино.",
    home: "Главная",
    guides: "Гайды",
    indexH1: "Гайды: выбор вместе или в соло",
    indexIntro:
      "Отдельные страницы под узкие запросы (статическая генерация, SSG). Movie Match в Google Play: сценарий с лобби и приглашением для совместного выбора и соло-подбор, когда выбираете только вы.",
    backToHome: "← На главную: Google Play и старт в вебе",
    footerCopyright: "©",
    articleAllGuides: "← Все гайды",
    articlePlayWeb: "Google Play и старт в вебе",
    ogTitle: "Гайды Movie Match",
    ogDescription:
      "Выбор вместе или в соло: лобби, приглашение и старт в Android из Google Play.",
  },
  en: {
    metaTitle: "Guides | Movie Match",
    metaDescription:
      "How to pick a movie together or solo: lobby, invite, and a quick movie-night flow.",
    home: "Home",
    guides: "Guides",
    indexH1: "Guides: pick together or solo",
    indexIntro:
      "Each page is a separate topic with static generation (SSG). Movie Match on Google Play: a lobby and invite flow for picking together, plus a solo picker when you choose a movie for yourself.",
    backToHome: "← Back to home: Google Play and web start",
    footerCopyright: "©",
    articleAllGuides: "← All guides",
    articlePlayWeb: "Google Play and web start",
    ogTitle: "Movie Match guides",
    ogDescription:
      "Picking together or solo: lobby, invite, and an Android start from Google Play.",
  },
  es: {
    metaTitle: "Guías | Movie Match",
    metaDescription:
      "Cómo elegir película juntos o en solitario: sala, invitación y un flujo rápido para la noche de cine.",
    home: "Inicio",
    guides: "Guías",
    indexH1: "Guías: elegir juntos o en solitario",
    indexIntro:
      "Cada página es un tema aparte con generación estática (SSG). Movie Match en Google Play: flujo con sala e invitación para elegir juntos, además de modo en solitario cuando eliges solo tú.",
    backToHome: "← Volver al inicio: Google Play y arranque web",
    footerCopyright: "©",
    articleAllGuides: "← Todas las guías",
    articlePlayWeb: "Google Play y arranque web",
    ogTitle: "Guías de Movie Match",
    ogDescription:
      "Elegir juntos o en solitario: sala, invitación y arranque en Android desde Google Play.",
  },
};

export function getGuidesPagesCopy(locale: SupportedLocale): GuidesPagesCopy {
  return copy[locale];
}
