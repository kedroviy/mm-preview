# Деплой на Render.com

Инструкция по деплою монорепозитория mm-preview (Next.js приложения: landing, user-creation, dashboard) на Render.com.

## Что уже настроено в репозитории

- **`render.yaml`** — Blueprint с тремя Web Service (landing, user-creation, dashboard). Каждый сервис собирается из корня репозитория и запускает свой Next.js app.
- **`.nvmrc`** — версия Node.js `20` для предсказуемых билдов на Render (соответствует `engines` в `package.json`).

## Как задеплоить

### Вариант 1: Blueprint (рекомендуется)

1. Залейте репозиторий в GitHub/GitLab и подключите его к [Render](https://dashboard.render.com).
2. В Render: **New** → **Blueprint**.
3. Укажите репозиторий; Render подхватит `render.yaml` и создаст три Web Service.
4. Для каждого сервиса задайте переменные окружения (см. ниже).

### Вариант 2: Ручное создание сервисов (Manual)

Для каждого приложения создаётся отдельный Web Service в [Render Dashboard](https://dashboard.render.com).

#### Важно: именно Web Service, не Static Site

Приложения — Next.js с SSR, им нужен запуск через `next start`. В Render выбирайте **Web Service** (Node), а не **Static Site**.

- У **Web Service** в форме есть **Start Command** и нет Publish Directory.
- У **Static Site** есть **Publish Directory** и нет Start Command.

Если видите поле «Publish Directory» — вы создаёте Static Site. Вернитесь к **New** и выберите **Web Service**.

#### Шаги для одного сервиса (повторить три раза: landing, user-creation, dashboard)

1. **New** → в списке типов выберите **Web Service** (не Static Site).
2. Подключите репозиторий (GitHub/GitLab), выберите репозиторий и ветку.
3. Заполните:
   - **Name** — например `mm-preview-landing`, `mm-preview-user-creation`, `mm-preview-dashboard`.
   - **Region** — по желанию.
   - **Runtime** — **Node**.
   - **Root Directory** — **оставьте пустым** (важно: сборка из корня монорепо).
   - **Build Command** — из таблицы ниже для этого приложения.
   - **Start Command** — из таблицы ниже.
4. В разделе **Environment** добавьте переменные (минимум `BACKEND_URL`, при необходимости `API_URL`). Сохраните.
5. Нажмите **Create Web Service** и дождитесь первого деплоя.

При необходимости в настройках сервиса (**Settings** → **Build & Deploy**) укажите **Node Version**: `20` (или Render подхватит из `.nvmrc`).

#### Команды для каждого сервиса

| Сервис        | Build Command                                                                 | Start Command                         |
|---------------|-------------------------------------------------------------------------------|----------------------------------------|
| Landing       | `npm ci && npx turbo run build --filter=@mm-preview/landing`                  | `cd apps/landing && npx next start`    |
| User creation | `npm ci && npx turbo run build --filter=@mm-preview/user-creation`            | `cd apps/user-creation && npx next start` |
| Dashboard     | `npm ci && npx turbo run build --filter=@mm-preview/dashboard`                 | `cd apps/dashboard && npx next start`  |

Копируйте строки **целиком** в поля Build Command и Start Command в Render. В фильтре Turbo обязательно **`@mm-preview/...`** (с символом `@`), иначе сборка не найдёт пакет.

## Почему билды проходят

1. **Сборка из корня** — зависимости ставятся один раз (`npm ci`), Turbo собирает только нужный app и его workspace-зависимости (`@mm-preview/sdk`, `@mm-preview/ui`).
2. **`postinstall`** — в корне выполняется `node packages/sdk/scripts/create-stubs.js`, создаются заглушки для сгенерированного SDK; TypeScript и билд не падают.
3. **Порт** — Render задаёт переменную `PORT`; `next start` без `-p` использует `process.env.PORT`, поэтому стартовая команда не привязана к конкретному порту.

## Переменные окружения

Задайте их в настройках каждого Web Service на Render (Environment).

### Общие (для всех трёх приложений)

| Переменная       | Описание | Пример |
|------------------|----------|--------|
| `BACKEND_URL`    | URL бэкенда (API + WebSocket). Используется в Next.js rewrites и серверном коде. | `https://api.moviematch.space` |
| `API_URL`        | То же для серверных запросов (если нужен отдельно от BACKEND_URL). | тот же URL, что и `BACKEND_URL` |

### Опционально (если нужны кастомные домены/URL приложений)

- `NEXT_PUBLIC_LANDING_URL` — публичный URL лендинга.
- `NEXT_PUBLIC_USER_CREATION_URL` — URL приложения создания пользователя.
- `NEXT_PUBLIC_DASHBOARD_URL` — URL дашборда.

Если не заданы, приложения используют свои Render URL.

### Прокси и клиентские запросы

В `next.config.ts` уже настроены **rewrites**: `/api/v1/*` и WebSocket-пути проксируются на `BACKEND_URL`. Поэтому:

- Клиентские запросы идут на тот же домен (через rewrites), CORS и cookies работают.
- На Render не нужен отдельный прокси: достаточно указать `BACKEND_URL`.

## Build filters (при использовании Blueprint)

В `render.yaml` для каждого сервиса заданы **buildFilter.paths**. Деплой сервиса запускается только при изменениях в:

- своём приложении (`apps/landing/**`, `apps/user-creation/**`, `apps/dashboard/**`);
- общих пакетах (`packages/**`);
- корневых `package.json` и `turbo.json`.

Так уменьшается число лишних билдов при правках только в одном приложении.

## Возможные проблемы

### Ошибка при `npm ci`

- Убедитесь, что в репозитории есть **`package-lock.json`** в корне и он закоммичен.

### Ошибка сборки Turbo / Next

- Проверьте, что **Root Directory** не задан (пустой), иначе Render не увидит корневой `package.json` и workspaces.
- Убедитесь, что Node версия **≥ 18** (лучше 20); при необходимости в настройках сервиса укажите **Node Version**: 20.

### Нативный модуль (например, `lightningcss`)

- На Render используется образ с инструментами для сборки нативных модулей; обычно установка проходит без доп. настроек. Если появится ошибка компиляции, можно попробовать явно задать Node 20 и пересобрать.

### WebSocket / cookies

- Бэкенд должен быть доступен по HTTPS и отдавать cookies с настройками, подходящими для домена фронтенда (см. `PROXY_SETUP.md`). На фронте достаточно задать `BACKEND_URL` на ваш бэкенд на Render.

## Краткий чеклист

1. Репозиторий подключён к Render, есть `render.yaml` и `.nvmrc`.
2. Root Directory у каждого сервиса **пустой**.
3. Build Command и Start Command как в таблице выше (или из `render.yaml`).
4. Для каждого сервиса заданы `BACKEND_URL` и при необходимости `API_URL`.
5. После деплоя проверены страницы и при необходимости WebSocket/логин.

После этого билды на Render должны проходить, а приложения — работать с вашим бэкендом.
