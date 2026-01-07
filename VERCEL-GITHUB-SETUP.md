# Деплой монорепо из GitHub на Vercel

## Как разнести приложения по отдельным проектам

Вы можете создать **несколько проектов в Vercel**, все подключенные к одному и тому же GitHub репозиторию, но с разными настройками.

## Пошаговая инструкция

### 1. Landing приложение

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **"Add New..." → "Project"**
3. Выберите ваш репозиторий `kedroviy/mm-preview`
4. Настройки проекта:
   - **Project Name:** `mm-preview-landing` (или любое другое имя)
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/landing` ⚠️ **ВАЖНО!**
   - **Build Command:** Оставьте пустым (Vercel автоматически подхватит `turbo run build` из `vercel.json`)
   - **Output Directory:** `.next` (оставьте по умолчанию)
   - **Install Command:** Оставьте по умолчанию (Vercel автоматически установит зависимости)
5. Нажмите **"Deploy"**

**Примечание:** Vercel автоматически определит Turborepo и настроит фильтр на основе Root Directory. Фильтр указывать не нужно!

### 2. User Creation приложение

1. Снова нажмите **"Add New..." → "Project"**
2. Выберите тот же репозиторий `kedroviy/mm-preview`
3. Настройки:
   - **Project Name:** `mm-preview-user-creation`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/user-creation` ⚠️ **ВАЖНО!**
   - **Build Command:** Оставьте пустым (Vercel автоматически подхватит из `vercel.json`)
   - **Output Directory:** `.next` (по умолчанию)
   - **Install Command:** Оставьте по умолчанию
4. Нажмите **"Deploy"**

### 3. Dashboard приложение

1. Снова **"Add New..." → "Project"**
2. Выберите тот же репозиторий `kedroviy/mm-preview`
3. Настройки:
   - **Project Name:** `mm-preview-dashboard`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/dashboard` ⚠️ **ВАЖНО!**
   - **Build Command:** Оставьте пустым (Vercel автоматически подхватит из `vercel.json`)
   - **Output Directory:** `.next` (по умолчанию)
   - **Install Command:** Оставьте по умолчанию
4. Нажмите **"Deploy"**

## Результат

У вас будет **3 отдельных проекта** в Vercel:
- `mm-preview-landing.vercel.app`
- `mm-preview-user-creation.vercel.app`
- `mm-preview-dashboard.vercel.app`

Все они подключены к одному репозиторию, но деплоятся независимо.

## Автоматический деплой

После настройки:
- Каждый push в `main` ветку будет автоматически деплоить все 3 проекта
- Или можно настроить разные ветки для каждого проекта

## Обновление констант после деплоя

После получения URL от Vercel, обновите константы в каждом приложении:

**apps/landing/src/shared/config/constants.ts:**
```typescript
export const APP_URLS = {
  LANDING: "https://mm-preview-landing.vercel.app",
  USER_CREATION: "https://mm-preview-user-creation.vercel.app",
  DASHBOARD: "https://mm-preview-dashboard.vercel.app",
} as const;
```

И аналогично в `apps/user-creation/src/shared/config/constants.ts`

## Как это работает

Согласно [официальной документации Vercel](https://vercel.com/docs/monorepos/turborepo):

1. **Vercel автоматически определяет Turborepo** - если в проекте есть `turbo.json`, Vercel автоматически настраивает сборку
2. **Turborepo доступен глобально** - не нужно добавлять как зависимость, Vercel предоставляет его автоматически
3. **Фильтр определяется автоматически** - на основе Root Directory Vercel автоматически определяет, какое приложение собирать
4. **Упрощенный build command** - достаточно просто `turbo run build`, фильтр добавляется автоматически

## Альтернатива: Использование vercel.json

Файлы `vercel.json` в каждой папке `apps/` уже созданы и настроены. Vercel автоматически подхватит настройки при импорте проекта. Вы можете оставить Build Command пустым в Dashboard - Vercel возьмет его из `vercel.json`.

## Проверка

После деплоя проверьте:
1. Все 3 проекта успешно собрались
2. Каждый имеет свой уникальный URL
3. Навигация между приложениями работает

