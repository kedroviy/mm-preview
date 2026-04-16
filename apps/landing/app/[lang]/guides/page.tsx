import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { getGuidesPagesCopy } from "@/src/shared/i18n/guides-pages";
import { getLandingDictionary } from "@/src/shared/i18n/landing-dictionary.server";
import { getGuidesIndexJsonLdString } from "@/src/shared/seo/guides-index-json-ld";
import { getGuidesForLocale } from "@/src/shared/seo/long-tail-guides";
import { getOpenGraphCopy } from "@/src/shared/seo/opengraph-copy";
import { Header } from "@/src/shared/ui/header";

export const dynamic = "force-static";

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
  const g = getGuidesPagesCopy(locale);
  const og = getOpenGraphCopy(locale);
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: {
      canonical: `/${locale}/guides`,
      languages: {
        "ru-RU": "/ru/guides",
        "en-US": "/en/guides",
        "es-ES": "/es/guides",
        "x-default": "/ru/guides",
      },
    },
    openGraph: {
      title: g.ogTitle,
      description: g.ogDescription,
      url: `/${locale}/guides`,
      type: "website",
      images: [
        {
          url: `/${locale}/guides/opengraph-image`,
          alt: og.guidesAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: g.ogTitle,
      description: g.ogDescription,
      images: [`/${locale}/guides/opengraph-image`],
    },
  };
}

export default async function GuidesIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const g = getGuidesPagesCopy(locale);
  const guides = getGuidesForLocale(locale);
  const jsonLd = getGuidesIndexJsonLdString(locale);
  const dictionary = await getLandingDictionary(locale);

  return (
    <div className="min-h-svh">
      <Script
        id="guides-index-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD без пользовательского ввода
        dangerouslySetInnerHTML={{
          // biome-ignore lint/style/useNamingConvention: имя поля задаёт React
          __html: jsonLd,
        }}
      />
      <Header
        lang={locale}
        copy={dictionary.header}
        switcherLocales={dictionary.switcherLocales}
      />
      <main
        id="top"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8"
      >
        <nav
          aria-label="Breadcrumbs"
          className="text-sm text-[var(--landing-muted)]"
        >
          <Link href={`/${locale}`} className="text-violet-600 hover:underline">
            {g.home}
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-[var(--landing-ink)]">{g.guides}</span>
        </nav>
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl">
          {g.indexH1}
        </h1>
        <p className="mt-4 text-lg text-[var(--landing-muted)]">{g.indexIntro}</p>
        <p className="mt-6">
          <Link
            href={`/${locale}#download`}
            className="text-sm font-semibold text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline"
          >
            {g.backToHome}
          </Link>
        </p>
        <ul className="mt-10 space-y-4">
          {guides.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/${locale}/guides/${item.slug}`}
                className="landing-glass block rounded-2xl border border-violet-100/90 p-5 no-underline transition hover:border-violet-200"
              >
                <span className="font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--landing-ink)]">
                  {item.h1}
                </span>
                <p className="mt-2 text-sm text-[var(--landing-muted)]">
                  {item.metaDescription}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <footer className="border-t border-violet-100/80 py-10 text-center text-sm text-[var(--landing-muted)]">
        <p>
          {g.footerCopyright} {new Date().getFullYear()} Movie Match ·{" "}
          <Link href={`/${locale}`} className="text-violet-600 hover:underline">
            {g.home}
          </Link>
        </p>
      </footer>
    </div>
  );
}
