# Исправление конфигурации для Vercel + Turborepo

## Что было исправлено

Согласно [официальной документации Vercel](https://vercel.com/docs/monorepos/turborepo):

### 1. Упрощены vercel.json файлы

**Было:**
```json
{
  "buildCommand": "cd ../.. && npm install && turbo run build --filter=@mm-preview/landing",
  "installCommand": "cd ../.. && npm install",
  "framework": "nextjs"
}
```

**Стало:**
```json
{
  "buildCommand": "turbo run build",
  "framework": "nextjs"
}
```

**Почему:**
- Turborepo доступен **глобально** на Vercel, не нужно устанавливать
- Фильтр (`--filter`) определяется **автоматически** на основе Root Directory
- `installCommand` не нужен - Vercel делает это автоматически
- `cd ../..` не нужен - Vercel уже в корне монорепо

### 2. Исправлены outputs в turbo.json

**Было:**
```json
"outputs": [".next/**", "!.next/cache/**", "dist/**"]
```

**Стало:**
```json
"outputs": [".next/**", "!.next/cache/**"]
```

**Почему:**
- Для Next.js нужен только `.next`
- `dist/**` не нужен для Next.js приложений

## Настройка в Vercel Dashboard

Для каждого проекта в Vercel:

1. **Root Directory:** `apps/landing` (или `apps/user-creation`, `apps/dashboard`)
2. **Framework Preset:** `Next.js`
3. **Build Command:** Оставьте пустым или `turbo run build` (Vercel подхватит из vercel.json)
4. **Output Directory:** Оставьте `.next` (по умолчанию)

## Как это работает

1. Vercel автоматически определяет Turborepo в проекте
2. Устанавливает зависимости из корня монорепо
3. Определяет фильтр на основе Root Directory
4. Запускает `turbo run build` с правильным фильтром
5. Находит outputs в `.next` для Next.js

## Проверка

После этих изменений деплой должен работать. Если есть ошибки:

1. Убедитесь, что Root Directory указан правильно
2. Проверьте, что все workspace зависимости установлены
3. Посмотрите логи сборки в Vercel Dashboard

