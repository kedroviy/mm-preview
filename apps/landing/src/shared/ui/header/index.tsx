"use client";

import { Button } from "@mm-preview/ui";
import { getAppUrls } from "@/src/shared/config/constants";

const nav = [
  { href: "#features", label: "Возможности" },
  { href: "/guides", label: "Гайды" },
  { href: "#download", label: "Google Play" },
  { href: "#faq", label: "Вопросы" },
  { href: "#reviews", label: "Отзывы" },
];

export function Header() {
  const handleStart = () => {
    const urls = getAppUrls();
    window.location.href = urls.USER_CREATION;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="landing-glass flex h-14 items-center justify-between gap-4 rounded-2xl px-4 shadow-[0_8px_32px_rgba(124,92,255,0.12)] sm:h-16 sm:rounded-full sm:px-6">
          <a
            href="#top"
            className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight sm:text-xl"
          >
            <span className="landing-headline-gradient bg-clip-text text-transparent">
              Movie Match
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={handleStart}
              className="rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 sm:px-5"
            >
              Начать
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
