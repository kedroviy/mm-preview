import type { SupportedLocale } from "@/src/shared/config/metadata";

export type FooterCopy = Readonly<{
  copyright: string;
  privacyPolicy: string;
  privacyPolicyAria: string;
}>;

export const FOOTER_COPY: Record<SupportedLocale, FooterCopy> = {
  ru: {
    copyright: "©",
    privacyPolicy: "Политика конфиденциальности",
    privacyPolicyAria: "Политика конфиденциальности Movie Match",
  },
  en: {
    copyright: "©",
    privacyPolicy: "Privacy Policy",
    privacyPolicyAria: "Movie Match Privacy Policy",
  },
  es: {
    copyright: "©",
    privacyPolicy: "Política de privacidad",
    privacyPolicyAria: "Política de privacidad de Movie Match",
  },
};

export function getFooterCopy(locale: SupportedLocale): FooterCopy {
  return FOOTER_COPY[locale] ?? FOOTER_COPY.ru;
}
