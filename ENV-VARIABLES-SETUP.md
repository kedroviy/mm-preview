# Настройка переменных окружения для URL приложений

## Проблема

При переходах между приложениями используются жестко закодированные URL, которые работают только локально. На Vercel нужны другие URL.

## Решение

Используются переменные окружения с fallback на локальные значения для разработки.

## Локальная разработка

### 1. Создайте `.env.local` файлы

Для каждого приложения создайте файл `.env.local` в корне приложения:

**apps/landing/.env.local:**
```env
NEXT_PUBLIC_LANDING_URL=http://landing.local
NEXT_PUBLIC_USER_CREATION_URL=http://user-creation.local
NEXT_PUBLIC_DASHBOARD_URL=http://dashboard.local
```

**apps/user-creation/.env.local:**
```env
NEXT_PUBLIC_LANDING_URL=http://landing.local
NEXT_PUBLIC_USER_CREATION_URL=http://user-creation.local
NEXT_PUBLIC_DASHBOARD_URL=http://dashboard.local
```

**apps/dashboard/.env.local:**
```env
NEXT_PUBLIC_LANDING_URL=http://landing.local
NEXT_PUBLIC_USER_CREATION_URL=http://user-creation.local
NEXT_PUBLIC_DASHBOARD_URL=http://dashboard.local
```

### 2. Перезапустите dev серверы

После создания `.env.local` файлов перезапустите dev серверы, чтобы переменные окружения загрузились.

## Production (Vercel)

### Автоматическое определение URL

Vercel автоматически предоставляет переменную `VERCEL_URL` для каждого деплоя. Но для межприложенных переходов нужно настроить URL вручную.

### Настройка в Vercel Dashboard

Для каждого проекта в Vercel:

1. Перейдите в **Settings** → **Environment Variables**
2. Добавьте следующие переменные:

**Для проекта `mm-preview-landing`:**
```
NEXT_PUBLIC_LANDING_URL=https://mm-preview-landing.vercel.app
NEXT_PUBLIC_USER_CREATION_URL=https://mm-preview-user-creation.vercel.app
NEXT_PUBLIC_DASHBOARD_URL=https://mm-preview-dashboard.vercel.app
```

**Для проекта `mm-preview-user-creation`:**
```
NEXT_PUBLIC_LANDING_URL=https://mm-preview-landing.vercel.app
NEXT_PUBLIC_USER_CREATION_URL=https://mm-preview-user-creation.vercel.app
NEXT_PUBLIC_DASHBOARD_URL=https://mm-preview-dashboard.vercel.app
```

**Для проекта `mm-preview-dashboard`:**
```
NEXT_PUBLIC_LANDING_URL=https://mm-preview-landing.vercel.app
NEXT_PUBLIC_USER_CREATION_URL=https://mm-preview-user-creation.vercel.app
NEXT_PUBLIC_DASHBOARD_URL=https://mm-preview-dashboard.vercel.app
```

3. Выберите **Environment**: `Production`, `Preview`, `Development` (или все)
4. Нажмите **Save**
5. Перезапустите деплой (или он перезапустится автоматически)

### Использование кастомных доменов

Если у вас настроены кастомные домены в Vercel, используйте их вместо `.vercel.app`:

```
NEXT_PUBLIC_LANDING_URL=https://landing.yourdomain.com
NEXT_PUBLIC_USER_CREATION_URL=https://user-creation.yourdomain.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.yourdomain.com
```

## Как это работает

В файле `src/shared/config/constants.ts` каждого приложения:

```typescript
function getAppUrl(key: "LANDING" | "USER_CREATION" | "DASHBOARD"): string {
  const envKey = `NEXT_PUBLIC_${key}_URL`;
  const envValue = process.env[envKey];

  if (envValue) {
    return envValue; // Используется значение из .env
  }

  // Fallback на локальные URL для разработки
  const localUrls = {
    LANDING: "http://landing.local",
    USER_CREATION: "http://user-creation.local",
    DASHBOARD: "http://dashboard.local",
  };

  return localUrls[key];
}

export const APP_URLS = {
  LANDING: getAppUrl("LANDING"),
  USER_CREATION: getAppUrl("USER_CREATION"),
  DASHBOARD: getAppUrl("DASHBOARD"),
} as const;
```

## Проверка

### Локально

1. Убедитесь, что `.env.local` файлы созданы
2. Перезапустите dev серверы
3. Проверьте переходы между приложениями

### На Vercel

1. Убедитесь, что переменные окружения настроены в Vercel Dashboard
2. Перезапустите деплой
3. Проверьте переходы между приложениями в production

## Важные замечания

1. **`NEXT_PUBLIC_` префикс обязателен** - только переменные с этим префиксом доступны на клиенте в Next.js
2. **`.env.local` не коммитится** - файл уже в `.gitignore`
3. **`.env.example` коммитится** - это шаблон для других разработчиков
4. **Перезапуск обязателен** - Next.js загружает переменные окружения только при старте

## Troubleshooting

### Переменные не работают

1. Проверьте, что переменные начинаются с `NEXT_PUBLIC_`
2. Перезапустите dev сервер
3. Проверьте, что `.env.local` находится в корне приложения (не в корне монорепо)
4. В production проверьте, что переменные добавлены в Vercel Dashboard

### Неправильные URL в production

1. Проверьте значения переменных в Vercel Dashboard
2. Убедитесь, что выбран правильный Environment (Production/Preview)
3. Перезапустите деплой

