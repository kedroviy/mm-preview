# Скрипт для настройки nginx на Windows

Write-Host "Настройка Nginx..." -ForegroundColor Green

# Проверяем, запущен ли nginx
$nginxProcess = Get-Process nginx -ErrorAction SilentlyContinue

if ($nginxProcess) {
    Write-Host "Останавливаем nginx..." -ForegroundColor Yellow
    taskkill /F /IM nginx.exe
    Start-Sleep -Seconds 2
}

# Ищем nginx
$nginxPath = $null
$possiblePaths = @(
    "C:\nginx",
    "C:\Program Files\nginx",
    "C:\Program Files (x86)\nginx",
    "$env:USERPROFILE\nginx"
)

foreach ($path in $possiblePaths) {
    if (Test-Path "$path\nginx.exe") {
        $nginxPath = $path
        break
    }
}

if (-not $nginxPath) {
    Write-Host "Nginx не найден! Установите nginx в одну из папок:" -ForegroundColor Red
    $possiblePaths | ForEach-Object { Write-Host "  - $_" }
    Write-Host "`nИли укажите путь к nginx вручную." -ForegroundColor Yellow
    exit 1
}

Write-Host "Найден nginx в: $nginxPath" -ForegroundColor Green

# Копируем конфигурацию
$configPath = "$nginxPath\conf\nginx.conf"
$backupPath = "$nginxPath\conf\nginx.conf.backup"

if (Test-Path $configPath) {
    Write-Host "Создаем резервную копию существующей конфигурации..." -ForegroundColor Yellow
    Copy-Item $configPath $backupPath -Force
}

Write-Host "Копируем новую конфигурацию..." -ForegroundColor Yellow
Copy-Item "nginx.conf" $configPath -Force

# Проверяем конфигурацию
Write-Host "Проверяем конфигурацию..." -ForegroundColor Yellow
Push-Location $nginxPath
$testResult = & .\nginx.exe -t 2>&1
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "Конфигурация валидна!" -ForegroundColor Green
    
    # Запускаем nginx
    Write-Host "Запускаем nginx..." -ForegroundColor Yellow
    Push-Location $nginxPath
    Start-Process .\nginx.exe
    Pop-Location
    
    Start-Sleep -Seconds 1
    
    if (Get-Process nginx -ErrorAction SilentlyContinue) {
        Write-Host "`nNginx успешно запущен!" -ForegroundColor Green
        Write-Host "`nПроверьте hosts файл (C:\Windows\System32\drivers\etc\hosts):" -ForegroundColor Yellow
        Write-Host "  127.0.0.1 landing.local" -ForegroundColor Cyan
        Write-Host "  127.0.0.1 user-creation.local" -ForegroundColor Cyan
        Write-Host "  127.0.0.1 dashboard.local" -ForegroundColor Cyan
        Write-Host "`nОткройте в браузере: http://landing.local" -ForegroundColor Green
    } else {
        Write-Host "Ошибка при запуске nginx!" -ForegroundColor Red
    }
} else {
    Write-Host "Ошибка в конфигурации:" -ForegroundColor Red
    Write-Host $testResult
    Write-Host "`nВосстанавливаем резервную копию..." -ForegroundColor Yellow
    if (Test-Path $backupPath) {
        Copy-Item $backupPath $configPath -Force
    }
}

