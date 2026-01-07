# Настройка проверки типов перед деплоем

## Что было сделано

1. ✅ Добавлен скрипт `type-check` во все приложения и пакеты
2. ✅ Настроен Turbo для запуска `type-check` перед `build`
3. ✅ Исправлены типы Button компонента

## Использование

### Локальная проверка перед коммитом

```bash
# Проверить типы во всех проектах
npm run type-check

# Или через turbo
turbo run type-check
```

### Автоматическая проверка при сборке

Теперь при запуске `npm run build` или `turbo run build`:
1. Сначала выполнится `type-check` для всех зависимостей
2. Затем выполнится `build`

Если есть ошибки типов, сборка не начнется.

## Что проверяется

- TypeScript типы во всех `.ts` и `.tsx` файлах
- Правильность использования компонентов
- Совместимость пропсов
- Импорты и экспорты

## Исправленные проблемы

### Button компонент

**Проблема:** TypeScript не распознавал `className`, `outlined`, `text`

**Решение:** Использован `ComponentPropsWithoutRef<typeof PrimeButton>` для правильного наследования всех пропсов PrimeReact Button

```typescript
export interface ButtonProps extends ComponentPropsWithoutRef<typeof PrimeButton> {
  children: React.ReactNode;
  className?: string;
  outlined?: boolean;
  text?: boolean;
}
```

## Рекомендации

1. **Перед коммитом:** Запускайте `npm run type-check`
2. **Перед деплоем:** Vercel автоматически проверит типы через `type-check` → `build`
3. **В CI/CD:** Добавьте `npm run type-check` как отдельный шаг

## Настройка в Vercel

Vercel автоматически запустит `type-check` перед `build` благодаря настройке в `turbo.json`:

```json
"build": {
  "dependsOn": ["^build", "type-check"],
  ...
}
```

Это означает, что сборка не начнется, пока не пройдут все проверки типов.

