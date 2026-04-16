"use client";

import { ButtonShadcn } from "@mm-preview/ui/light";
import { usePathname, useRouter } from "next/navigation";
import { getGooglePlayUrl } from "@/src/shared/config/constants";
import {
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import type { HeaderCopy } from "@/src/shared/i18n/landing-dictionary";

function buildLocalizedPath(pathname: string, nextLang: SupportedLocale) {
  const parts = pathname.split("/");
  const current = parts[1] as SupportedLocale | undefined;
  if (current && (current === "ru" || current === "en" || current === "es")) {
    parts[1] = nextLang;
    return parts.join("/") || `/${nextLang}`;
  }
  return `/${nextLang}${pathname === "/" ? "" : pathname}`;
}

export function Header({
  lang,
  copy,
  switcherLocales,
}: {
  lang: SupportedLocale;
  copy: HeaderCopy;
  switcherLocales: SupportedLocale[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const text = copy;
  const base = `/${lang}`;
  const nav = [
    { href: `${base}#features`, label: text.features },
    { href: `${base}/guides`, label: text.guides },
    { href: `${base}#download`, label: text.download },
    { href: `${base}#faq`, label: text.faq },
    { href: `${base}#reviews`, label: text.reviews },
  ];

  const handleStartGooglePlay = () => {
    window.location.href = getGooglePlayUrl();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="landing-glass flex h-14 items-center justify-between gap-4 rounded-2xl px-4 shadow-[0_8px_32px_rgba(124,92,255,0.12)] sm:h-16 sm:rounded-full sm:px-6">
          <a
            href="#top"
            className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight sm:text-xl"
            aria-label={text.brandAria}
          >
            <span className="landing-headline-gradient bg-clip-text text-transparent">
              Movie Match
            </span>
          </a>
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Разделы страницы"
          >
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
            <label className="sr-only" htmlFor="landing-lang">
              {text.langAria}
            </label>
            <select
              id="landing-lang"
              value={lang}
              onChange={(e) => {
                const nextLang = e.target.value as SupportedLocale;
                router.push(buildLocalizedPath(pathname, nextLang));
              }}
              className="h-9 rounded-full border border-violet-200/70 bg-white/70 px-3 text-sm text-[var(--landing-ink)] shadow-sm backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:bg-white/10"
              aria-label={text.langAria}
            >
              {switcherLocales.map((localeCode) => (
                <option key={localeCode} value={localeCode}>
                  {localeCode.toUpperCase()}
                </option>
              ))}
            </select>
            <ButtonShadcn
              type="button"
              onClick={handleStartGooglePlay}
              className="rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 sm:px-5"
              aria-label={text.startAria}
            >
              {text.start}
            </ButtonShadcn>
          </div>
        </div>
      </div>
    </header>
  );
}
