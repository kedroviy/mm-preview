# MM Preview - Turborepo Monorepo

Монорепозиторий с тремя Next.js приложениями, использующий Turborepo для управления зависимостями.

## Структура проекта

```
mm-preview/
├── apps/
│   ├── landing/          # Лендинг страница (порт 3000)
│   ├── user-creation/     # Создание пользователя (порт 3001)
│   └── dashboard/         # Дашборд (порт 3002)
├── packages/
│   └── ui/                # Общие UI компоненты с Storybook и тестами
└── turbo.json             # Конфигурация Turborepo
```

## Приложения

### Landing (порт 3000)
Главная страница с хедером и кнопкой "Начать" для перехода к созданию аккаунта.

### User Creation (порт 3001)
Форма создания пользователя с использованием:
- `react-hook-form` для валидации форм
- `@tanstack/react-query` для управления состоянием
- После успешного создания пользователя происходит переход на Dashboard

### Dashboard (порт 3002)
Главная страница дашборда после создания пользователя.

## Пакеты

### @mm-preview/ui
Общий пакет UI компонентов с:
- Storybook для документации компонентов
- Тестами на Vitest + React Testing Library
- Компонент Button из PrimeReact

### @mm-preview/sdk
SDK для работы с API, включающий:
- API клиент на основе fetch (heyApi) с поддержкой всех HTTP методов
- Интеграция с TanStack Query
- Готовые хуки для работы с данными (useUsers, useCreateUser и т.д.)
- Кастомный Query Client с оптимальными настройками
- Автоматическая обработка ошибок
- Поддержка query параметров
- Настраиваемый timeout
- Типизация TypeScript
- Swagger документация доступна на http://localhost:3000/api

#### Использование SDK с хуками (рекомендуется)

```typescript
import { useCreateUser, useUsers } from "@mm-preview/sdk";

// В компоненте
function MyComponent() {
  const { data: users, isLoading } = useUsers({ page: 1, limit: 10 });
  const createUser = useCreateUser();

  const handleCreate = () => {
    createUser.mutate({
      name: "John",
      email: "john@example.com",
      password: "password123",
    });
  };
}
```

#### Прямое использование API клиента

```typescript
import { api, usersApi } from "@mm-preview/sdk";

// Использование готового сервиса
const user = await usersApi.createUser({
  name: "John",
  email: "john@example.com",
  password: "password123",
});

// Или прямое использование API клиента
const response = await api.get("/endpoint");
```

#### Расширение API на основе Swagger

1. Откройте Swagger документацию: http://localhost:3000/api
2. Создайте новый файл в `packages/sdk/src/services/` для вашего эндпоинта
3. Используйте структуру из `users.ts` как пример
4. Создайте хуки в `packages/sdk/src/hooks/` (например, `useMovies.ts`)
5. Экспортируйте новый сервис и хуки из `packages/sdk/src/index.ts`

## Установка

```bash
npm install
```

## Разработка

Запуск всех приложений в режиме разработки:
```bash
npm run dev
```

Запуск конкретного приложения:
```bash
cd apps/landing && npm run dev
cd apps/user-creation && npm run dev
cd apps/dashboard && npm run dev
```

## Сборка

Сборка всех приложений:
```bash
npm run build
```

## Тестирование

Запуск тестов для UI пакета:
```bash
cd packages/ui && npm run test
```

Запуск тестов с UI:
```bash
cd packages/ui && npm run test:ui
```

## Storybook

Запуск Storybook для UI компонентов:
```bash
cd packages/ui && npm run storybook
```

Storybook будет доступен на `http://localhost:6006`

## Линтинг

```bash
npm run lint
```

## Форматирование

```bash
npm run format
```

## Поток работы

1. Пользователь открывает Landing (http://localhost:3000)
2. Нажимает кнопку "Create Account" (компонент из @mm-preview/ui)
3. Переходит на страницу создания пользователя (http://localhost:3001)
4. Заполняет форму и создает аккаунт
5. После успешного создания автоматически переходит на Dashboard (http://localhost:3002)

## Технологии

- **Next.js 15.5.4** - React фреймворк
- **React 19.2.3** - UI библиотека
- **Turborepo** - Монорепо инструмент
- **PrimeReact** - UI компоненты
- **React Hook Form** - Управление формами
- **TanStack Query** - Управление состоянием и запросами
- **Vitest** - Тестирование
- **Storybook** - Документация компонентов
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
