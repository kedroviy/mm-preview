import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  HREFLANG_FOR_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { getLandingDictionary } from "@/src/shared/i18n/landing-dictionary.server";
import { getPrivacyPolicyContent } from "@/src/shared/i18n/privacy-policy-content";
import { Header } from "@/src/shared/ui/header";

export const dynamic = "force-static";

export function generateStaticParams(): { lang: SupportedLocale }[] {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const content = getPrivacyPolicyContent(locale);
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        [HREFLANG_FOR_LOCALE.ru]: "/ru/privacy",
        [HREFLANG_FOR_LOCALE.en]: "/en/privacy",
        [HREFLANG_FOR_LOCALE.es]: "/es/privacy",
        "x-default": "/ru/privacy",
      },
    },
    robots: { index: true, follow: true },
  };
}

const homeLabel: Record<SupportedLocale, string> = {
  ru: "Главная",
  en: "Home",
  es: "Inicio",
};

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const content = getPrivacyPolicyContent(locale);
  const dictionary = await getLandingDictionary(locale);

  return (
    <div className="min-h-svh">
      <Header
        lang={locale}
        copy={dictionary.header}
        switcherLocales={dictionary.switcherLocales}
      />
      <main id="top" tabIndex={-1}>
        <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <nav
            className="text-sm text-[var(--landing-muted)]"
            aria-label="Breadcrumbs"
          >
            <Link
              href={`/${locale}`}
              className="text-violet-600 hover:underline"
            >
              {homeLabel[locale]}
            </Link>
          </nav>
          <h1 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl">
            {content.h1}
          </h1>
          <p className="mt-3 text-sm text-[var(--landing-muted)]">
            {content.updatedAt}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-[var(--landing-muted)]">
            {content.intro}
          </p>
          <div className="mt-10 space-y-10">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--landing-ink)]">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 leading-relaxed text-[var(--landing-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
