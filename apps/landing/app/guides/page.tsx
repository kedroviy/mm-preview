import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getGuidesIndexJsonLdString } from "@/src/shared/seo/guides-index-json-ld";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";
import { Header } from "@/src/shared/ui/header";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Гайды: совместный и соло-подбор фильма | Movie Match",
  description:
    "Материалы: друзья, пара, соло-подбор на вечер, лобби, Google Play, киновечер. Приложение Movie Match.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Гайды Movie Match",
    description:
      "Совместный выбор и соло-подбор: лобби, приглашение, Android из Google Play.",
    url: "/guides",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Гайды Movie Match",
    description:
      "Совместный выбор и соло-подбор: лобби, приглашение, Android из Google Play.",
  },
};

export default function GuidesIndexPage() {
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
      <Header />
      <main
        id="top"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8"
      >
        <nav
          aria-label="Хлебные крошки"
          className="text-sm text-[var(--landing-muted)]"
        >
          <Link href="/" className="text-violet-600 hover:underline">
            Главная
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-[var(--landing-ink)]">Гайды</span>
        </nav>
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl">
          Гайды: совместный выбор и соло-подбор фильма
        </h1>
        <p className="mt-4 text-lg text-[var(--landing-muted)]">
          Каждая страница — отдельная тема и статическая выдача (SSG) для
          поисковиков. Movie Match в Google Play: лобби и приглашение для
          совместного просмотра и отдельный соло-подбор, когда выбираете кино на
          вечер одни.
        </p>
        <p className="mt-6">
          <Link
            href="/#download"
            className="text-sm font-semibold text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline"
          >
            ← На главную: Google Play и веб-старт
          </Link>
        </p>
        <ul className="mt-10 space-y-4">
          {LONG_TAIL_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
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
          <Link href="/" className="text-violet-600 hover:underline">
            На главную
          </Link>
        </p>
      </footer>
    </div>
  );
}
