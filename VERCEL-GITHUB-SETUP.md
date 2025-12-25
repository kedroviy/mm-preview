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
   - **Build Command:** `cd ../.. && turbo run build --filter=@mm-preview/landing`
   - **Output Directory:** `.next` (оставьте по умолчанию)
   - **Install Command:** `cd ../.. && npm install`
5. Нажмите **"Deploy"**

### 2. User Creation приложение

1. Снова нажмите **"Add New..." → "Project"**
2. Выберите тот же репозиторий `kedroviy/mm-preview`
3. Настройки:
   - **Project Name:** `mm-preview-user-creation`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/user-creation` ⚠️ **ВАЖНО!**
   - **Build Command:** `cd ../.. && turbo run build --filter=@mm-preview/user-creation`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Нажмите **"Deploy"**

### 3. Dashboard приложение

1. Снова **"Add New..." → "Project"**
2. Выберите тот же репозиторий `kedroviy/mm-preview`
3. Настройки:
   - **Project Name:** `mm-preview-dashboard`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/dashboard` ⚠️ **ВАЖНО!**
   - **Build Command:** `cd ../.. && turbo run build --filter=@mm-preview/dashboard`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
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

## Альтернатива: Использование vercel.json

Если хотите автоматизировать, можно использовать файлы `vercel.json` в каждой папке `apps/`, которые я уже создал. Vercel автоматически подхватит настройки при импорте проекта.

## Проверка

После деплоя проверьте:
1. Все 3 проекта успешно собрались
2. Каждый имеет свой уникальный URL
3. Навигация между приложениями работает

