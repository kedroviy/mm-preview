import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { getGuidesIndexJsonLdString } from "@/src/shared/seo/guides-index-json-ld";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";
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
  return {
    title: "Guides | Movie Match",
    description:
      "How to pick a movie together or solo: lobby, invite, and a quick movie night flow.",
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
      title: "Movie Match Guides",
      description:
        "Picking together or solo: lobby, invite, and an Android start from Google Play.",
      url: `/${locale}/guides`,
      type: "website",
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
  const jsonLd = getGuidesIndexJsonLdString();

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
      <Header lang={locale} />
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
            Home
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-[var(--landing-ink)]">Guides</span>
        </nav>
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl">
          Guides: pick together or solo
        </h1>
        <p className="mt-4 text-lg text-[var(--landing-muted)]">
          Each page is a separate topic with static generation (SSG). Movie Match
          on Google Play: a lobby and invite flow for picking together, plus a
          solo picker when you choose a movie for yourself.
        </p>
        <p className="mt-6">
          <Link
            href={`/${locale}#download`}
            className="text-sm font-semibold text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline"
          >
            ← Back to home: Google Play and web start
          </Link>
        </p>
        <ul className="mt-10 space-y-4">
          {LONG_TAIL_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/${locale}/guides/${g.slug}`}
                className="landing-glass block rounded-2xl border border-violet-100/90 p-5 no-underline transition hover:border-violet-200"
              >
                <span className="font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--landing-ink)]">
                  {g.h1}
                </span>
                <p className="mt-2 text-sm text-[var(--landing-muted)]">
                  {g.metaDescription}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <footer className="border-t border-violet-100/80 py-10 text-center text-sm text-[var(--landing-muted)]">
        <p>
          © {new Date().getFullYear()} Movie Match ·{" "}
          <Link href={`/${locale}`} className="text-violet-600 hover:underline">
            Home
          </Link>
        </p>
      </footer>
    </div>
  );
}

