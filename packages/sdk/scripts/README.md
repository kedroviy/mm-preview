# SDK Generation Scripts

Этот набор скриптов автоматически генерирует TypeScript типы, запросы и хуки для TanStack Query из Swagger/OpenAPI спецификации.

## Скрипты

### 1. `generate:swagger` - Скачивание Swagger документации
Скачивает Swagger JSON спецификацию с API сервера.

```bash
npm run generate:swagger
```

По умолчанию скачивает с `http://localhost:4000/api-json`. Можно изменить через переменную окружения:
```bash
SWAGGER_URL=http://localhost:4000/api-json npm run generate:swagger
```

### 2. `generate:types` - Генерация TypeScript типов
Генерирует TypeScript типы из Swagger спецификации.

```bash
npm run generate:types
```

Типы сохраняются в `src/generated/types.ts`.

### 3. `generate:requests` - Генерация запросов
Генерирует функции запросов для каждого endpoint из Swagger.

```bash
npm run generate:requests
```

Запросы группируются по тегам и сохраняются в `src/generated/requests/`.

### 4. `generate:hooks` - Генерация TanStack Query хуков
Генерирует хуки для TanStack Query (useQuery, useMutation) для каждого endpoint.

```bash
npm run generate:hooks
```

Хуки группируются по тегам и сохраняются в `src/generated/hooks/`.

### 5. `generate:all` - Генерация всего
Запускает все скрипты генерации последовательно.

```bash
npm run generate:all
```

## Использование

После генерации, раскомментируйте экспорты в `src/index.ts`:

```typescript
export * from "./generated/types";
export * from "./generated/requests";
export * from "./generated/hooks";
```

Затем используйте в вашем коде:

```typescript
import { useCreateUser, useUsers } from "@mm-preview/sdk";

function MyComponent() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  
  // ...
}
```

## Структура сгенерированных файлов

```
src/generated/
├── types.ts              # TypeScript типы из Swagger
├── requests/
│   ├── users.ts         # Запросы для users endpoints
│   ├── rooms.ts         # Запросы для rooms endpoints
│   └── index.ts         # Экспорты всех запросов
└── hooks/
    ├── useUsers.ts      # Хуки для users endpoints
    ├── useRooms.ts      # Хуки для rooms endpoints
    └── index.ts         # Экспорты всех хуков
```

