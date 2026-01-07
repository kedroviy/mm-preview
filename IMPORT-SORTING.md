# Сортировка импортов

## Настройка

В проекте используется **Biome** для автоматической сортировки импортов. Biome уже установлен и настроен.

## Использование

### Автоматическая сортировка импортов

```bash
# Сортировать импорты во всех файлах
npm run format:imports

# Или через biome напрямую
biome check --write --organize-imports-enabled=true
```

### Форматирование + сортировка импортов

```bash
# Форматировать код и отсортировать импорты
npm run format:all
```

### Только форматирование (без сортировки импортов)

```bash
npm run format
```

## Как работает сортировка

Biome автоматически:
1. Группирует импорты по типам:
   - Внешние библиотеки (react, next, primereact и т.д.)
   - Внутренние пакеты (@mm-preview/*)
   - Относительные импорты (./, ../)
2. Сортирует импорты внутри каждой группы по алфавиту
3. Удаляет неиспользуемые импорты
4. Объединяет несколько импортов из одного модуля

## Пример

**До:**
```typescript
import { useState } from "react";
import { Button } from "@mm-preview/ui";
import { Card } from "primereact/card";
import { useRouter } from "next/navigation";
import { APP_URLS } from "@/src/shared/config/constants";
```

**После:**
```typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "@mm-preview/ui";
import { APP_URLS } from "@/src/shared/config/constants";
```

## Интеграция с IDE

### VS Code / Cursor

Biome автоматически работает при сохранении файла, если установлено расширение Biome.

### Ручная сортировка

В VS Code/Cursor можно использовать команду:
- `Cmd/Ctrl + Shift + P` → "Organize Imports" (если установлен Biome extension)

## Автоматизация

### Перед коммитом

Рекомендуется запускать перед коммитом:

```bash
npm run format:all
```

### В CI/CD

Можно добавить проверку в CI:

```bash
npx biome check
```

Это проверит, что все импорты отсортированы, но не изменит файлы. Если нужно применить исправления, используйте `--write`.

## Настройки

Текущие настройки в `biome.json`:

```json
{
  "organizeImports": {
    "enabled": true
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

## Полезные команды

```bash
# Проверить, какие файлы нужно отсортировать (без изменений)
npx biome check

# Отсортировать импорты в конкретной папке
npx biome check --write apps/landing/src

# Отсортировать импорты в конкретном файле
npx biome check --write apps/landing/src/app/page.tsx

# Отсортировать импорты во всем проекте
npm run format:imports
```

