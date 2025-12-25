# Настройка Nginx для проксирования приложений

## Быстрая настройка

### 1. Установка Nginx для Windows

1. Скачайте Nginx: https://nginx.org/en/download.html
2. Распакуйте в `C:\nginx`
3. Запустите `nginx.exe`

### 2. Настройка hosts файла

Откройте `C:\Windows\System32\drivers\etc\hosts` от имени администратора и добавьте:

```
127.0.0.1 landing.local
127.0.0.1 user-creation.local
127.0.0.1 dashboard.local
```

### 3. Копирование конфигурации

Скопируйте `nginx.conf` из корня проекта в `C:\nginx\conf\nginx.conf`

### 4. Перезапуск Nginx

```powershell
taskkill /F /IM nginx.exe
cd C:\nginx
start nginx.exe
```

### 5. Проверка

Откройте в браузере:
- http://landing.local
- http://user-creation.local
- http://dashboard.local

## Альтернатива: Использование путей

Если не хотите настраивать hosts, используйте `nginx-paths.conf`:

- http://localhost/landing
- http://localhost/user-creation
- http://localhost/dashboard

## Полезные команды

```powershell
# Проверить конфигурацию
nginx -t

# Перезагрузить конфигурацию
nginx -s reload

# Остановить
nginx -s stop

# Проверить статус
tasklist | findstr nginx
```

