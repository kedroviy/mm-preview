"use client";

import { useState } from "react";
import type { SupportedLocale } from "@/src/shared/config/metadata";
import {
  getLandingMessage,
  type LandingMessages,
} from "@/src/shared/i18n/landing-messages";

type Scenario = "friends" | "couple" | "solo";

/** Лёгкий интерактив без тяжёлых зависимостей — удержание на странице. */
export function ScenarioPicker({
  lang,
  messages,
}: {
  lang: SupportedLocale;
  messages: LandingMessages;
}) {
  const [scenario, setScenario] = useState<Scenario>("friends");
  const t = (key: string) => getLandingMessage(messages, lang, key);
  const scenarioCopy: Record<
    Scenario,
    { label: string; body: string; hint: string }
  > = {
    friends: {
      label: t("scenario.friends.label"),
      body: t("scenario.friends.body"),
      hint: t("scenario.friends.hint"),
    },
    couple: {
      label: t("scenario.couple.label"),
      body: t("scenario.couple.body"),
      hint: t("scenario.couple.hint"),
    },
    solo: {
      label: t("scenario.solo.label"),
      body: t("scenario.solo.body"),
      hint: t("scenario.solo.hint"),
    },
  };

  const active = scenarioCopy[scenario];

  return (
    <section
      id="scenario"
      className="scroll-mt-28 py-16 sm:scroll-mt-32 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2
          id="scenario-heading"
          className="text-center font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl"
        >
          {t("scenario.title")}
        </h2>
        <p
          id="scenario-description"
          className="mx-auto mt-3 max-w-lg text-center text-[var(--landing-muted)]"
        >
          {t("scenario.description")}
        </p>
        <fieldset
          className="mt-8 flex flex-wrap justify-center gap-3 border-0 p-0"
          aria-labelledby="scenario-heading"
          aria-describedby="scenario-description"
        >
          <legend className="sr-only">{t("scenario.legend")}</legend>
          {(Object.keys(scenarioCopy) as Scenario[]).map((key) => (
            <label
              key={key}
              className={
                key === scenario
                  ? "cursor-pointer rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/30"
                  : "cursor-pointer rounded-full border border-violet-200 bg-white px-6 py-2.5 text-sm font-semibold text-violet-900 shadow-sm hover:bg-violet-50/90"
              }
            >
              <input
                type="radio"
                name="landing-scenario"
                value={key}
                checked={key === scenario}
                onChange={() => setScenario(key)}
                className="sr-only"
              />
              {scenarioCopy[key].label}
            </label>
          ))}
        </fieldset>
        <div
          className="landing-glass mt-8 rounded-3xl border border-violet-100/90 p-8 shadow-md shadow-violet-100/40"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-lg leading-relaxed text-slate-700">
            {active.body}
          </p>
          <p className="mt-4 text-sm font-medium text-violet-700">
            {active.hint}
          </p>
        </div>
      </div>
    </section>
  );
}
