# Настройка Nginx для проксирования приложений

## Вариант 1: Использование поддоменов (рекомендуется)

### Шаг 1: Установка Nginx

**Windows:**
1. Скачайте Nginx для Windows: https://nginx.org/en/download.html
2. Распакуйте в `C:\nginx` (или другое место)
3. Запустите `nginx.exe` из папки установки

**Проверка установки:**
```bash
# Проверьте, что nginx запущен
tasklist | findstr nginx
```

### Шаг 2: Настройка hosts файла

Добавьте следующие строки в файл `C:\Windows\System32\drivers\etc\hosts` (требуются права администратора):

```
127.0.0.1 landing.local
127.0.0.1 user-creation.local
127.0.0.1 dashboard.local
```

### Шаг 3: Копирование конфигурации

1. Скопируйте файл `nginx.conf` из корня проекта в папку `conf` вашей установки nginx
2. Обычно это `C:\nginx\conf\nginx.conf` (замените существующий файл)

### Шаг 4: Перезапуск Nginx

```bash
# Остановить nginx
taskkill /F /IM nginx.exe

# Запустить nginx
cd C:\nginx
start nginx.exe
```

### Шаг 5: Обновление констант в приложениях

Обновите файлы с константами URL:

**apps/landing/src/shared/config/constants.ts:**
```typescript
export const APP_URLS = {
  LANDING: "http://landing.local",
  USER_CREATION: "http://user-creation.local",
  DASHBOARD: "http://dashboard.local",
} as const;
```

**apps/user-creation/src/shared/config/constants.ts:**
```typescript
export const APP_URLS = {
  LANDING: "http://landing.local",
  USER_CREATION: "http://user-creation.local",
  DASHBOARD: "http://dashboard.local",
} as const;
```

## Вариант 2: Использование путей (без настройки hosts)

Если не хотите настраивать hosts файл, можно использовать пути:

```
http://localhost/landing
http://localhost/user-creation
http://localhost/dashboard
```

Для этого используйте конфигурацию `nginx-paths.conf` (см. ниже).

## Полезные команды

```bash
# Проверить конфигурацию nginx
nginx -t

# Перезагрузить конфигурацию без остановки
nginx -s reload

# Остановить nginx
nginx -s stop

# Проверить статус
tasklist | findstr nginx
```

## Проверка работы

После настройки откройте в браузере:
- http://landing.local
- http://user-creation.local
- http://dashboard.local

