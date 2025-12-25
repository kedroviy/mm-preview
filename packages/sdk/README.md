# @mm-preview/sdk

SDK для работы с API, включающий:
- API клиент на основе fetch (heyApi)
- Интеграция с TanStack Query
- Готовые хуки для работы с данными
- Кастомный Query Client с оптимальными настройками

## Установка

Пакет уже включен в монорепо и доступен через workspace.

## Использование

### Использование с TanStack Query (рекомендуется)

```typescript
import { useCreateUser, useUsers } from "@mm-preview/sdk";

// В компоненте
function MyComponent() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();

  const handleCreate = () => {
    createUser.mutate({
      name: "John",
      email: "john@example.com",
      password: "password123",
    });
  };

  // ...
}
```

### Базовое использование API клиента

```typescript
import { api } from "@mm-preview/sdk";

// GET запрос
const response = await api.get("/users");
console.log(response.data);

// POST запрос
const newUser = await api.post("/users", {
  name: "John",
  email: "john@example.com",
});

// PUT запрос
const updated = await api.put("/users/1", {
  name: "Jane",
});

// PATCH запрос
const patched = await api.patch("/users/1", {
  email: "jane@example.com",
});

// DELETE запрос
await api.delete("/users/1");
```

### Настройка Query Client

```typescript
import { createQueryClient } from "@mm-preview/sdk";
import { QueryClientProvider } from "@tanstack/react-query";

const queryClient = createQueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Ваше приложение */}
    </QueryClientProvider>
  );
}
```

### Создание кастомного API клиента

```typescript
import { createApiClient } from "@mm-preview/sdk";

const customApi = createApiClient({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
  headers: {
    Authorization: "Bearer token",
  },
});
```

### Работа с параметрами запроса

```typescript
const response = await api.get("/users", {
  params: {
    page: 1,
    limit: 10,
    search: "john",
  },
});
```

### Обработка ошибок

```typescript
import { api, type ApiError } from "@mm-preview/sdk";

try {
  const response = await api.post("/users", userData);
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message);
  console.error(apiError.status);
}
```

## Конфигурация

По умолчанию клиент использует:
- `baseURL`: `http://localhost:3000/api`
- `timeout`: 30000ms (30 секунд)
- `Content-Type`: `application/json`

## API

### Методы

- `get<T>(url, config?)` - GET запрос
- `post<T>(url, data?, config?)` - POST запрос
- `put<T>(url, data?, config?)` - PUT запрос
- `patch<T>(url, data?, config?)` - PATCH запрос
- `delete<T>(url, config?)` - DELETE запрос

### Типы

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface RequestConfig extends RequestInit {
  baseURL?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  timeout?: number;
}
```

