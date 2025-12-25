# Настройка Vercel для монорепо

## Важно для монорепо

Vercel нужно настроить отдельно для каждого приложения. Не пытайтесь деплоить корневой проект.

## Настройка каждого приложения

### 1. Landing приложение

1. В Vercel Dashboard создайте новый проект
2. Подключите репозиторий
3. Настройки проекта:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/landing`
   - **Build Command:** `cd ../.. && npm run build --filter=@mm-preview/landing`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`

### 2. User Creation приложение

1. Создайте отдельный проект в Vercel
2. Настройки:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/user-creation`
   - **Build Command:** `cd ../.. && npm run build --filter=@mm-preview/user-creation`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`

### 3. Dashboard приложение

1. Создайте отдельный проект в Vercel
2. Настройки:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/dashboard`
   - **Build Command:** `cd ../.. && npm run build --filter=@mm-preview/dashboard`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`

## Альтернатива: Использование Turborepo

Если у вас есть Vercel Pro, можно использовать встроенную поддержку Turborepo:

1. В настройках проекта включите "Turborepo"
2. Укажите `Root Directory` для каждого приложения
3. Vercel автоматически определит зависимости

## Через Vercel CLI

```bash
# Для каждого приложения отдельно
vercel --cwd apps/landing
vercel --cwd apps/user-creation
vercel --cwd apps/dashboard
```

## Обновление констант для production

После деплоя обновите `APP_URLS` в каждом приложении на реальные домены Vercel:

```typescript
export const APP_URLS = {
  LANDING: "https://your-landing-app.vercel.app",
  USER_CREATION: "https://your-user-creation-app.vercel.app",
  DASHBOARD: "https://your-dashboard-app.vercel.app",
} as const;
```

## Проблемы и решения

### Ошибка: "Cannot find module"

Убедитесь, что:
1. `Root Directory` указан правильно
2. `Install Command` устанавливает зависимости из корня
3. Workspace зависимости установлены

### Ошибка: "Build failed"

Проверьте:
1. Все пакеты (`@mm-preview/ui`, `@mm-preview/sdk`) доступны
2. `transpilePackages` указаны в `next.config.ts`
3. Turbo правильно настроен

