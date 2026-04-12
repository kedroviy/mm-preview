import type { Metadata } from "next";
import Link from "next/link";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";
import { Header } from "@/src/shared/ui/header";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Гайды: совместный выбор фильма и Movie Match",
  description:
    "Материалы под длинные запросы: друзья, пара, лобби, Google Play, киновечер. Приложение Movie Match — один сценарий.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Гайды Movie Match",
    description:
      "Совместный выбор фильма: лобби, приглашение, Android из Google Play.",
    url: "/guides",
    type: "website",
  },
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <nav className="text-sm text-[var(--landing-muted)]">
          <Link href="/" className="text-violet-600 hover:underline">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--landing-ink)]">Гайды</span>
        </nav>
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl">
          Гайды по совместному выбору фильма
        </h1>
        <p className="mt-4 text-lg text-[var(--landing-muted)]">
          Каждая страница — отдельная тема и статическая выдача (SSG) для
          поисковиков. Сценарий везде один: Movie Match с лобби и приглашением,
          как в Google Play.
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
    </div>
  );
}
