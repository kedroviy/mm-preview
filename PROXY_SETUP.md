# Настройка проксирования API через Vercel

## Обзор

Настроено проксирование API запросов через Vercel для решения проблем с CORS и cookies. Клиентские запросы проксируются через `/api`, а серверные запросы и WebSocket используют прямой URL.

## Архитектура

### Клиентские запросы (браузер)
- Используют относительный путь `/api` (проксируется через Vercel rewrites)
- В разработке можно использовать `NEXT_PUBLIC_USE_API_PROXY=true` для тестирования прокси

### Серверные запросы (middleware, server components)
- Всегда используют прямой URL из `NEXT_PUBLIC_API_URL` или `API_URL`
- Не проходят через Vercel rewrites

### WebSocket соединения
- Всегда используют прямой URL
- Не могут быть проксированы через rewrites

## Настройка Vercel

### 1. Обновите `vercel.json` в каждом приложении

В файлах `apps/dashboard/vercel.json`, `apps/user-creation/vercel.json`, `apps/landing/vercel.json` уже настроен URL бэкенда:

```json
{
  "buildCommand": "turbo run build",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://mm-admin.onrender.com/:path*"
    }
  ]
}
```

### 2. Настройка переменных окружения

В настройках Vercel для каждого приложения установите:

- **Для продакшена (с прокси):**
  - `NEXT_PUBLIC_USE_API_PROXY=true` (опционально, по умолчанию включено в продакшене)
  - `NEXT_PUBLIC_API_URL` - не устанавливайте или оставьте пустым (будет использоваться `/api`)

- **Для разработки (без прокси):**
  - `NEXT_PUBLIC_API_URL=http://localhost:4000` (или ваш dev URL)
  - `NEXT_PUBLIC_USE_API_PROXY=false` или не устанавливайте

- **Для серверных запросов:**
  - `API_URL=https://mm-admin.onrender.com` (используется только на сервере)

## Как это работает

### Клиентские запросы

```typescript
import { api } from "@mm-preview/sdk";

// В продакшене: запрос идет на /api/users/profile
// Vercel проксирует его на https://mm-admin.onrender.com/users/profile
// Браузер видит запрос как идущий с того же домена
const response = await api.get("/users/profile");
```

### Серверные запросы

```typescript
import { getServerApiUrl } from "@mm-preview/sdk";

// Всегда использует прямой URL
const apiUrl = getServerApiUrl(); // https://mm-admin.onrender.com
const response = await fetch(`${apiUrl}/users/profile`);
```

### WebSocket

```typescript
import { getWebSocketUrl } from "@mm-preview/sdk";

// Всегда использует прямой URL
const wsUrl = getWebSocketUrl(); // wss://mm-admin.onrender.com/rooms
const socket = io(wsUrl);
```

## Преимущества

1. **Решение проблем с CORS**: Запросы идут с того же домена, что и фронтенд
2. **Работа с cookies**: Браузер видит Set-Cookie как идущий с того же домена
3. **Безопасность**: Не нужно настраивать CORS на бэкенде для фронтенда
4. **Гибкость**: Можно легко переключаться между прокси и прямым подключением

## Важные замечания

1. **WebSocket не может быть проксирован**: WebSocket соединения всегда используют прямой URL
2. **Серверные запросы не проксируются**: Middleware и server components всегда используют прямой URL
3. **Cookies на бэкенде**: Убедитесь, что на бэкенде:
   - `SameSite=Lax` (не `None`)
   - `Secure=true` (для HTTPS)
   - Не устанавливайте `Domain`, либо установите его точно соответствующим домену Vercel

## Отладка

Если прокси не работает:

1. Проверьте, что URL в `vercel.json` правильный
2. Проверьте логи Vercel в разделе Functions
3. Убедитесь, что переменные окружения установлены правильно
4. Для тестирования прокси в разработке установите `NEXT_PUBLIC_USE_API_PROXY=true`

