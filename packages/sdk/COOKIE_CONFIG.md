# Конфигурация разрешенных доменов для куки

Эта конфигурация позволяет явно указать, какие домены и URL разрешены для использования кросс-доменных куки с `SameSite=None; Secure`.

## Переменные окружения

### `ALLOWED_COOKIE_DOMAINS`

Список разрешенных доменов через запятую. Поддерживает wildcards.

**Формат:**
```
ALLOWED_COOKIE_DOMAINS=domain1.com,domain2.com,*.vercel.app
```

**Примеры:**
- `ALLOWED_COOKIE_DOMAINS=vercel.app,localhost` - разрешает все домены на vercel.app и localhost
- `ALLOWED_COOKIE_DOMAINS=*.example.com` - разрешает все поддомены example.com
- `ALLOWED_COOKIE_DOMAINS=api.example.com,backend.example.com` - разрешает только конкретные домены

**По умолчанию:**
- `*.vercel.app` - все поддомены Vercel (mm-preview-user-creation.vercel.app, mm-preview-dashboard.vercel.app и т.д.)
- `vercel.app` - базовый домен Vercel
- `localhost`
- `127.0.0.1`

### `ALLOWED_COOKIE_URLS`

Список разрешенных URL через запятую. Используется для дополнительной проверки API URL.

**Формат:**
```
ALLOWED_COOKIE_URLS=https://api.example.com,https://backend.vercel.app
```

**По умолчанию:**
- Используется значение из `NEXT_PUBLIC_API_URL`, если установлено

## Как это работает

1. **Проверка доменов**: Система проверяет, разрешен ли домен приложения и домен API в списке `ALLOWED_COOKIE_DOMAINS`
2. **Кросс-доменные запросы**: Если домены разные и оба разрешены, используется `SameSite=None; Secure`
3. **Dev режим**: В development режиме всегда используется `SameSite=Lax` (не кросс-доменный)

## Примеры использования

### Production на Vercel

```env
ALLOWED_COOKIE_DOMAINS=*.vercel.app,api.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Custom домены

```env
ALLOWED_COOKIE_DOMAINS=myapp.com,api.myapp.com
NEXT_PUBLIC_API_URL=https://api.myapp.com
```

### Локальная разработка

В dev режиме переменные не требуются - автоматически используется `SameSite=Lax` для localhost.

## Безопасность

- Только домены из `ALLOWED_COOKIE_DOMAINS` могут использовать `SameSite=None`
- `SameSite=None` всегда требует `Secure` (HTTPS)
- В dev режиме `SameSite=None` не используется

