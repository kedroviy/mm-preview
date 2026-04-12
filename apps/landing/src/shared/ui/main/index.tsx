"use client";

import { Button } from "@mm-preview/ui";
import Link from "next/link";
import { getAppUrls, getGooglePlayUrl } from "@/src/shared/config/constants";
import { LONG_TAIL_GUIDES } from "@/src/shared/seo/long-tail-guides";
import { LandingFaq } from "@/src/shared/ui/landing-faq/LandingFaq";
import { Reveal } from "@/src/shared/ui/reveal";
import { ScenarioPicker } from "@/src/shared/ui/scenario-picker/ScenarioPicker";
import { features, reviews } from "./lib/constants";

function GooglePlayBadge({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Google Play</title>
      <rect
        width="180"
        height="53"
        rx="8"
        fill="#000"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
      />
      <path d="M12 15.5L28 26.5L12 37.5V15.5Z" fill="url(#gp-a)" />
      <path d="M12 15.5L28 26.5L36 21L12 10V15.5Z" fill="url(#gp-b)" />
      <path d="M12 37.5L28 26.5L36 32L12 43V37.5Z" fill="url(#gp-c)" />
      <path d="M28 26.5L36 21V32L28 26.5Z" fill="url(#gp-d)" />
      <text
        x="48"
        y="22"
        fill="#fff"
        fontSize="9"
        fontFamily="system-ui,sans-serif"
        letterSpacing="0.06em"
      >
        GET IT ON
      </text>
      <text
        x="48"
        y="38"
        fill="#fff"
        fontSize="14"
        fontFamily="system-ui,sans-serif"
        fontWeight="500"
      >
        Google Play
      </text>
      <defs>
        <linearGradient
          id="gp-a"
          x1="8"
          y1="40"
          x2="26"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00D4FF" />
          <stop offset="1" stopColor="#00F076" />
        </linearGradient>
        <linearGradient
          id="gp-b"
          x1="8"
          y1="10"
          x2="34"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFD800" />
          <stop offset="1" stopColor="#FF4E00" />
        </linearGradient>
        <linearGradient
          id="gp-c"
          x1="10"
          y1="42"
          x2="34"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF4E00" />
          <stop offset="1" stopColor="#FC1964" />
        </linearGradient>
        <linearGradient
          id="gp-d"
          x1="26"
          y1="20"
          x2="38"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00F076" />
          <stop offset="1" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MainBlock() {
  const handleCreateUser = () => {
    const urls = getAppUrls();
    window.location.href = urls.USER_CREATION;
  };

  const playUrl = getGooglePlayUrl();

  return (
    <div id="top" className="relative">
      <section className="relative min-h-[100svh] overflow-hidden pt-28 pb-16 sm:pt-32">
        <div className="landing-mesh" aria-hidden>
          <div className="landing-mesh-blob" />
          <div className="landing-mesh-blob" />
          <div className="landing-mesh-blob" />
        </div>
        <div className="landing-grid-bg" aria-hidden />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--landing-muted)] shadow-sm shadow-violet-100/80 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Movie Match · развлечения · Google Play
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--landing-ink)] sm:text-6xl lg:text-7xl">
              Фильм для вечера —{" "}
              <span className="landing-headline-gradient">без споров</span>
              <br className="hidden sm:block" /> с друзьями, парой или в соло
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--landing-muted)] sm:text-xl">
              Как в приложении в Google Play: лобби, приглашение и совместный
              выбор с друзьями или партнёром — или соло-подбор, когда один
              человек подбирает себе кино на вечер без лобби и без второго
              участника.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button
                onClick={handleCreateUser}
                className="group relative overflow-hidden rounded-full border-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] px-8 py-3 text-base font-semibold text-white shadow-xl shadow-violet-500/30 transition hover:bg-[position:100%_0]"
              >
                Создать аккаунт (веб)
              </Button>
              <a
                href={playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-8 py-3 text-base font-semibold text-violet-900 shadow-md shadow-violet-100 transition hover:border-violet-300 hover:bg-violet-50/90"
              >
                <i className="pi pi-google text-lg" />
                Скачать в Google Play
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="landing-glass relative overflow-hidden rounded-3xl border border-violet-100 p-1 shadow-md shadow-violet-100/40">
              <div className="landing-shimmer-line absolute inset-x-0 top-0 h-px" />
              <div className="flex overflow-hidden rounded-[1.35rem] bg-gradient-to-r from-white via-violet-50/40 to-emerald-50/30 py-3">
                <div className="landing-marquee-track gap-12 pr-12 text-sm font-medium text-[var(--landing-muted)]">
                  {(["marquee-a", "marquee-b"] as const).map((marqueeKey) => (
                    <div
                      key={marqueeKey}
                      className="flex shrink-0 items-center gap-12"
                    >
                      {[
                        "Лобби",
                        "Приглашение друга",
                        "Соло-подбор",
                        "Компания друзей",
                        "Вдвоём с партнёром",
                        "Драма",
                        "Комедия",
                        "Триллер",
                        "Совместный выбор",
                        "Без споров",
                        "Как в Google Play",
                      ].map((t) => (
                        <span
                          key={`${marqueeKey}-${t}`}
                          className="flex items-center gap-2 whitespace-nowrap"
                        >
                          <i className="pi pi-film text-violet-500" />
                          {t}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="landing-glass landing-card-hover relative overflow-hidden rounded-3xl p-8 lg:col-span-2">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-300/35 blur-3xl" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-600">
                    Сценарий из приложения
                  </p>
                  <p className="mt-2 max-w-md text-2xl font-semibold text-[var(--landing-ink)] sm:text-3xl">
                    Лобби → приглашение → совместный подбор — и отдельно
                    соло-подбор для вечера одному.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="h-24 w-20 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 ring-1 ring-violet-200/80 transition hover:rotate-[-4deg]" />
                  <div className="h-28 w-20 translate-y-2 rounded-2xl bg-gradient-to-br from-fuchsia-200/90 to-violet-200/80 ring-1 ring-fuchsia-200/80 transition hover:-translate-y-1" />
                  <div className="h-24 w-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 ring-1 ring-emerald-200/80 transition hover:rotate-[4deg]" />
                </div>
              </div>
            </div>
            <div className="landing-glass landing-card-hover flex flex-col justify-between rounded-3xl p-8">
              <div>
                <p className="text-4xl font-[family-name:var(--font-syne)] font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  Play
                </p>
                <p className="mt-1 text-sm text-[var(--landing-muted)]">
                  приложение уже в каталоге Google Play (Entertainment)
                </p>
              </div>
              <div className="mt-8 space-y-3 border-t border-violet-100 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <i className="pi pi-check-circle text-emerald-500" />
                  Лобби и приглашение друга
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <i className="pi pi-check-circle text-emerald-500" />
                  Совместный выбор без споров
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <i className="pi pi-check-circle text-emerald-500" />
                  Соло-подбор фильма на вечер
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Google Play — выделенный блок */}
      <section
        id="download"
        className="relative scroll-mt-28 py-12 sm:scroll-mt-32 sm:py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-violet-100/40 to-emerald-50/30" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="landing-border-beam relative overflow-hidden rounded-[2rem] border border-violet-200/90 bg-gradient-to-br from-white via-violet-50/80 to-emerald-50/50 p-1 shadow-[0_24px_80px_-24px_rgba(124,92,255,0.2)]">
              <div className="relative rounded-[1.85rem] bg-white/95 px-6 pb-14 pt-12 shadow-inner shadow-violet-50/50 sm:px-12 sm:pb-20 sm:pt-16">
                <div className="absolute left-1/2 top-0 h-40 w-[min(90%,480px)] -translate-x-1/2 rounded-full bg-violet-200/50 blur-[100px]" />
                <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800 ring-1 ring-violet-200/80">
                      Google Play · Entertainment
                    </span>
                    <h2 className="mt-5 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.2] tracking-tight text-[var(--landing-ink)] sm:text-4xl sm:leading-[1.18] lg:text-5xl lg:leading-[1.15]">
                      Скачай{" "}
                      <span className="landing-gradient-clip bg-gradient-to-r from-emerald-600 to-teal-600">
                        Movie Match
                      </span>{" "}
                      в Google Play
                    </h2>
                    <p className="mt-4 max-w-xl text-lg text-[var(--landing-muted)]">
                      Официальное описание в магазине: приложение помогает
                      выбрать фильм в компании друзей или супругов — больше
                      никаких споров при совместном выборе. Плюс в приложении
                      есть соло-подбор: один человек может подобрать себе кино
                      на вечер. Лобби и приглашение — когда смотрите вместе.
                    </p>
                    <p className="mt-4 text-sm text-[var(--landing-muted)]">
                      Пакет{" "}
                      <code className="rounded-md bg-violet-50 px-1.5 py-0.5 text-violet-900 ring-1 ring-violet-100">
                        com.moviematcher
                      </code>
                      . В Vercel ссылку задаёт{" "}
                      <code className="rounded-md bg-violet-50 px-1.5 py-0.5 text-violet-900 ring-1 ring-violet-100">
                        NEXT_PUBLIC_GOOGLE_PLAY_URL
                      </code>
                      .
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="relative flex w-full max-w-sm flex-col items-center rounded-2xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 p-8 shadow-md shadow-violet-100/60 transition hover:border-violet-200">
                      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-violet-100/60 via-transparent to-emerald-100/40" />
                      <a
                        href={playUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                      >
                        <GooglePlayBadge className="h-14 w-auto drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition group-hover:scale-[1.03]" />
                        <span className="text-center text-sm text-[var(--landing-muted)]">
                          Откроется карточка приложения в Google Play
                        </span>
                      </a>
                    </div>
                    <a
                      href={playUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline"
                    >
                      Открыть Movie Match в Google Play →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-28 py-16 sm:scroll-mt-32 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl">
              Совместно и в одиночку
            </h2>
            <p className="mt-3 text-[var(--landing-muted)]">
              В карточке приложения: лобби, приглашение и совместный выбор — и
              соло-подбор, когда фильм на вечер выбираете только вы.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 70}
                className={`landing-glass landing-card-hover rounded-3xl p-8 ${f.span}`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 ring-1 ring-violet-200/80">
                  <i className={`pi ${f.icon} text-xl text-violet-600`} />
                </div>
                <h3 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--landing-ink)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[var(--landing-muted)]">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ScenarioPicker />

      <section
        id="guides"
        className="scroll-mt-28 border-t border-violet-100/90 py-16 sm:scroll-mt-32 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl">
              Гайды: выбор фильма и Movie Match
            </h2>
            <p className="mt-3 text-[var(--landing-muted)]">
              Отдельные страницы под узкие запросы — лобби, пара, компания,
              соло-подбор, Google Play. Всё в одном приложении.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LONG_TAIL_GUIDES.map((g, i) => (
              <Reveal key={g.slug} delay={i * 40}>
                <li>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="landing-glass landing-card-hover flex h-full flex-col rounded-2xl border border-violet-100/90 p-6 no-underline transition hover:border-violet-200"
                  >
                    <span className="font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--landing-ink)]">
                      {g.h1}
                    </span>
                    <span className="mt-2 line-clamp-3 text-sm text-[var(--landing-muted)]">
                      {g.metaDescription}
                    </span>
                    <span className="mt-4 text-sm font-medium text-violet-600">
                      Читать →
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 text-center">
            <Link
              href="/guides"
              className="text-sm font-semibold text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline"
            >
              Все материалы на одной странице →
            </Link>
          </p>
        </div>
      </section>

      <LandingFaq />

      <section
        id="reviews"
        className="scroll-mt-28 border-t border-violet-100/90 py-16 sm:scroll-mt-32 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl">
              Отзывы
            </h2>
            <p className="mt-3 text-[var(--landing-muted)]">
              Коротко — как это ощущается в жизни, а не в презентации.
            </p>
          </Reveal>
          <div className="mt-12 grid auto-rows-fr gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 80} className="h-full min-h-0">
                <blockquote className="landing-glass landing-card-hover flex h-full min-h-0 flex-col rounded-3xl p-8">
                  <p className="text-lg leading-relaxed text-slate-700">
                    «{r.quote}»
                  </p>
                  <footer className="mt-auto flex items-center gap-3 border-t border-violet-100 pt-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white">
                      {r.name[0]}
                    </div>
                    <div>
                      <cite className="not-italic font-semibold text-[var(--landing-ink)]">
                        {r.name}
                      </cite>
                      <p className="text-sm text-[var(--landing-muted)]">
                        {r.role}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24 pt-8">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <div className="landing-glass relative overflow-hidden rounded-[2rem] px-8 py-14 sm:px-16">
              <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-200/60 blur-[90px]" />
              <div className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-100/80 blur-[90px]" />
              <h2 className="relative font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl">
                Готов убрать хаос из выбора фильма?
              </h2>
              <p className="relative mx-auto mt-4 max-w-lg text-[var(--landing-muted)]">
                В вебе — быстрый старт с аккаунтом; в Android — то же Movie
                Match из Google Play: совместный выбор в лобби или соло-подбор
                фильма на вечер одному.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={handleCreateUser}
                  className="rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-300/50 transition hover:brightness-105"
                >
                  Начать в браузере
                </Button>
                <a
                  href={playUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-8 py-3 text-base font-semibold text-violet-900 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
                >
                  Открыть в Google Play
                </a>
              </div>
            </div>
          </Reveal>
        </div>
        <footer className="mx-auto mt-16 max-w-6xl px-4 text-center text-sm text-[var(--landing-muted)] sm:px-6">
          <p>© {new Date().getFullYear()} Movie Match</p>
        </footer>
      </section>
    </div>
  );
}
