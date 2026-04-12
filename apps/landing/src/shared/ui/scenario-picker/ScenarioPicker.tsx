"use client";

import { Button } from "@mm-preview/ui";
import { useState } from "react";

type Scenario = "friends" | "couple";

const copy: Record<Scenario, { label: string; body: string; hint: string }> = {
  friends: {
    label: "С друзьями",
    body: "В компании чаще всего страдает синхронизация: кто-то в личке, кто-то в общем чате. Movie Match завязан на одном лобби и приглашении — вы заранее собираете состав, а потом идёте в подбор, как в описании приложения в Google Play.",
    hint: "Дальше: создайте комнату в приложении и разошлите приглашение до того, как начнётся «а у меня тут ещё пять вариантов».",
  },
  couple: {
    label: "Вдвоём",
    body: "В паре больше эмоций вокруг «ты опять не угадал». Совместный подбор в Movie Match симметричен: не один тянет выбор, а оба участвуют в одном потоке — меньше ощущения, что ответственность лежит на одном человеке.",
    hint: "Если удобнее начать с телефона — карточка Movie Match в Google Play; если с браузера — кнопка создания аккаунта на этом сайте.",
  },
};

/** Лёгкий интерактив без тяжёлых зависимостей — удержание на странице. */
export function ScenarioPicker() {
  const [scenario, setScenario] = useState<Scenario>("friends");

  const active = copy[scenario];

  return (
    <section
      id="scenario"
      className="scroll-mt-28 py-16 sm:scroll-mt-32 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl">
          Ваш сценарий
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-[var(--landing-muted)]">
          Нажмите вариант — коротко о том, как Movie Match ложится на вечер с
          друзьями или вдвоём.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {(Object.keys(copy) as Scenario[]).map((key) => (
            <Button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              className={
                key === scenario
                  ? "rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/30"
                  : "rounded-full border border-violet-200 bg-white px-6 py-2.5 text-sm font-semibold text-violet-900 shadow-sm hover:bg-violet-50/90"
              }
            >
              {copy[key].label}
            </Button>
          ))}
        </div>
        <div className="landing-glass mt-8 rounded-3xl border border-violet-100/90 p-8 shadow-md shadow-violet-100/40">
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
