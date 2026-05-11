export type { GuideSection, LongTailGuide } from "./long-tail-guides-types";

import {
  DEFAULT_LOCALE,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { LONG_TAIL_GUIDES_EN } from "./long-tail-guides-en";
import { LONG_TAIL_GUIDES_ES } from "./long-tail-guides-es";
import { LONG_TAIL_GUIDES_RU } from "./long-tail-guides-ru";
import type { LongTailGuide } from "./long-tail-guides-types";

const GUIDES_BY_LOCALE: Record<SupportedLocale, LongTailGuide[]> = {
  ru: LONG_TAIL_GUIDES_RU,
  en: LONG_TAIL_GUIDES_EN,
  es: LONG_TAIL_GUIDES_ES,
};

export const LONG_TAIL_GUIDES = LONG_TAIL_GUIDES_RU;

export function getGuidesForLocale(locale: SupportedLocale): LongTailGuide[] {
  return GUIDES_BY_LOCALE[locale];
}

export function getLongTailGuideBySlug(
  slug: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
): LongTailGuide | undefined {
  return getGuidesForLocale(locale).find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): { slug: string }[] {
  return LONG_TAIL_GUIDES_RU.map((g) => ({ slug: g.slug }));
}
