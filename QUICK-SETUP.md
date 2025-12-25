# Быстрая настройка Nginx

## Шаг 1: Установите Nginx

Скачайте и распакуйте: https://nginx.org/en/download.html
Обычно в `C:\nginx`

## Шаг 2: Запустите скрипт настройки

```powershell
.\setup-nginx.ps1
```

Или вручную:

### 2.1. Остановите nginx (если запущен)
```powershell
taskkill /F /IM nginx.exe
```

### 2.2. Скопируйте конфигурацию
```powershell
Copy-Item nginx.conf C:\nginx\conf\nginx.conf -Force
```

### 2.3. Проверьте конфигурацию
```powershell
cd C:\nginx
.\nginx.exe -t
```

### 2.4. Запустите nginx
```powershell
.\nginx.exe
```

## Шаг 3: Настройте hosts файл

Откройте `C:\Windows\System32\drivers\etc\hosts` **от имени администратора** и добавьте:

```
127.0.0.1 landing.local
127.0.0.1 user-creation.local
127.0.0.1 dashboard.local
```

## Шаг 4: Запустите приложения

В другом терминале:
```powershell
npm run dev
```

## Шаг 5: Проверьте

Откройте в браузере:
- http://landing.local
- http://user-creation.local  
- http://dashboard.local

## Если видите "Welcome to nginx"

Это значит nginx использует дефолтную конфигурацию. Выполните шаг 2 заново и убедитесь, что:
1. Конфигурация скопирована в правильное место
2. Nginx перезапущен после копирования
3. Проверка конфигурации прошла успешно (`nginx -t`)

