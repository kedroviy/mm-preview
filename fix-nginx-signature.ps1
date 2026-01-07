# Скрипт для обхода предупреждения о цифровой подписи nginx

Write-Host "Проверка и настройка nginx..." -ForegroundColor Green

$nginxPath = "C:\Users\aliaksei\Downloads\nginx-1.28.1\nginx-1.28.1\nginx.exe"

if (-not (Test-Path $nginxPath)) {
    Write-Host "Nginx не найден по пути: $nginxPath" -ForegroundColor Red
    exit 1
}

# Разблокируем файл
Write-Host "Разблокировка файла..." -ForegroundColor Yellow
Unblock-File -Path $nginxPath -ErrorAction SilentlyContinue

# Проверяем размер файла (должен быть около 1-2 МБ)
$fileSize = (Get-Item $nginxPath).Length / 1MB
Write-Host "Размер файла: $([math]::Round($fileSize, 2)) МБ" -ForegroundColor Cyan

if ($fileSize -lt 0.5 -or $fileSize -gt 5) {
    Write-Host "⚠️  ВНИМАНИЕ: Размер файла подозрительный!" -ForegroundColor Red
    Write-Host "Официальный nginx.exe должен быть около 1-2 МБ" -ForegroundColor Yellow
} else {
    Write-Host "✓ Размер файла в норме" -ForegroundColor Green
}

# Проверяем наличие README
$readmePath = Join-Path (Split-Path $nginxPath) "README.txt"
if (Test-Path $readmePath) {
    Write-Host "✓ README.txt найден - это похоже на официальную версию" -ForegroundColor Green
} else {
    Write-Host "⚠️  README.txt не найден" -ForegroundColor Yellow
}

Write-Host "`nИнформация о предупреждении:" -ForegroundColor Cyan
Write-Host "Официальные бинарники nginx для Windows НЕ имеют цифровой подписи Microsoft." -ForegroundColor Yellow
Write-Host "Это нормально и безопасно, если вы скачали с nginx.org" -ForegroundColor Yellow

Write-Host "`nСпособы обхода предупреждения:" -ForegroundColor Cyan
Write-Host "1. Запуск через cmd (не PowerShell):" -ForegroundColor White
Write-Host "   cd C:\Users\aliaksei\Downloads\nginx-1.28.1\nginx-1.28.1" -ForegroundColor Gray
Write-Host "   nginx.exe" -ForegroundColor Gray

Write-Host "`n2. Временное изменение политики выполнения:" -ForegroundColor White
Write-Host "   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process" -ForegroundColor Gray

Write-Host "`n3. Добавить в исключения Windows Defender:" -ForegroundColor White
Write-Host "   Настройки Windows -> Безопасность -> Защита от вирусов -> Исключения" -ForegroundColor Gray

Write-Host "`nПроверка источника:" -ForegroundColor Cyan
Write-Host "Убедитесь, что скачали с: https://nginx.org/en/download.html" -ForegroundColor Yellow
Write-Host "Раздел: Stable version -> nginx/Windows-X.X.X" -ForegroundColor Yellow


