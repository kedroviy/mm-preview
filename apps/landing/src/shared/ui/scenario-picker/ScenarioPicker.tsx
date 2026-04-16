"use client";

import { useState } from "react";
import type { SupportedLocale } from "@/src/shared/config/metadata";
import {
  type ScenarioKey,
  getLandingCopy,
} from "@/src/shared/i18n/landing-content";

/** Лёгкий интерактив без тяжёлых зависимостей — удержание на странице. */
export function ScenarioPicker({ lang }: { lang: SupportedLocale }) {
  const [scenario, setScenario] = useState<ScenarioKey>("friends");
  const copy = getLandingCopy(lang);
  const scenarioCopy = copy.scenarioByKey;

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
          {copy.scenarioHeading}
        </h2>
        <p
          id="scenario-description"
          className="mx-auto mt-3 max-w-lg text-center text-[var(--landing-muted)]"
        >
          {copy.scenarioSub}
        </p>
        <fieldset
          className="mt-8 flex flex-wrap justify-center gap-3 border-0 p-0"
          aria-labelledby="scenario-heading"
          aria-describedby="scenario-description"
        >
          <legend className="sr-only">{copy.scenarioLegend}</legend>
          {(["friends", "couple", "solo"] as const).map((key) => (
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
