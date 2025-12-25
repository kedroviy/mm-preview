# Запуск проекта с Docker

## Требования

- Docker Desktop для Windows
- Docker Compose

## Быстрый старт

### 1. Запуск всех сервисов

```bash
docker-compose up -d
```

### 2. Добавление в hosts файл

Добавьте в `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 landing.local
127.0.0.1 user-creation.local
127.0.0.1 dashboard.local
```

### 3. Проверка

Откройте в браузере:
- http://landing.local
- http://user-creation.local
- http://dashboard.local

## Полезные команды

```bash
# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка
docker-compose up --build

# Остановка и удаление volumes
docker-compose down -v
```

## Только Nginx в Docker

Если хотите запустить только nginx в Docker, а приложения локально:

```bash
docker run -d \
  --name nginx-proxy \
  -p 80:80 \
  -v ${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

## Без Docker (рекомендуется для разработки)

Для разработки проще запускать приложения локально через `npm run dev`, а nginx установить напрямую. См. `README-nginx.md`

