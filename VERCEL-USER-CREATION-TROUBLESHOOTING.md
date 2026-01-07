# Решение проблем с деплоем user-creation на Vercel

## Проверка конфигурации

Конфигурация `apps/user-creation/vercel.json` выглядит правильно:
```json
{
  "buildCommand": "turbo run build",
  "framework": "nextjs"
}
```

## Пошаговая инструкция по добавлению user-creation в Vercel

### 1. Создание нового проекта

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **"Add New..." → "Project"**
3. Выберите ваш репозиторий (тот же, что и для landing/dashboard)
4. **ВАЖНО:** Не нажимайте "Deploy" сразу!

### 2. Настройка проекта

В разделе **"Configure Project"**:

1. **Project Name:** `mm-preview-user-creation`
2. **Framework Preset:** `Next.js` (должен определиться автоматически)
3. **Root Directory:** 
   - Нажмите "Edit"
   - Введите: `apps/user-creation` ⚠️ **КРИТИЧЕСКИ ВАЖНО!**
   - Нажмите "Continue"
4. **Build Command:** Оставьте пустым (Vercel возьмет из `vercel.json`)
5. **Output Directory:** `.next` (по умолчанию)
6. **Install Command:** Оставьте по умолчанию

### 3. Переменные окружения (опционально)

Если хотите явно указать URL (хотя это не обязательно, так как URL определяются автоматически):

1. В разделе **"Environment Variables"** добавьте:
   ```
   NEXT_PUBLIC_LANDING_URL=https://mm-preview-landing.vercel.app
   NEXT_PUBLIC_USER_CREATION_URL=https://mm-preview-user-creation.vercel.app
   NEXT_PUBLIC_DASHBOARD_URL=https://mm-preview-dashboard.vercel.app
   ```
2. Выберите **Environment**: `Production`, `Preview`, `Development`

### 4. Деплой

Нажмите **"Deploy"** и дождитесь завершения сборки.

## Возможные проблемы и решения

### Проблема 1: "Cannot find module @mm-preview/ui" или "@mm-preview/sdk"

**Причина:** Workspace зависимости не установлены

**Решение:**
1. Убедитесь, что **Root Directory** указан правильно: `apps/user-creation`
2. Vercel должен автоматически установить зависимости из корня монорепо
3. Если проблема сохраняется, добавьте в **Install Command**:
   ```
   cd ../.. && npm install
   ```

### Проблема 2: "Build failed" или "Command failed"

**Причина:** Ошибка сборки

**Решение:**
1. Проверьте логи сборки в Vercel Dashboard
2. Убедитесь, что все зависимости установлены
3. Проверьте, что `turbo.json` настроен правильно
4. Убедитесь, что `next.config.ts` содержит `transpilePackages`

### Проблема 3: Проект не появляется в списке

**Причина:** Проект не был создан

**Решение:**
1. Убедитесь, что вы нажали "Add New Project", а не пытались добавить в существующий
2. Проверьте, что выбран правильный репозиторий
3. Убедитесь, что у вас есть права на репозиторий

### Проблема 4: Root Directory не сохраняется

**Причина:** Vercel может не сохранить Root Directory при первом деплое

**Решение:**
1. После первого деплоя зайдите в **Settings** → **General**
2. Найдите **Root Directory**
3. Установите: `apps/user-creation`
4. Сохраните и перезапустите деплой

## Проверка после деплоя

После успешного деплоя проверьте:

1. ✅ Проект появился в списке проектов Vercel
2. ✅ URL доступен: `https://mm-preview-user-creation.vercel.app`
3. ✅ Страница загружается без ошибок
4. ✅ Переходы с landing на user-creation работают
5. ✅ Переходы с user-creation на dashboard работают

## Альтернативный способ: Vercel CLI

Если через Dashboard не получается, можно использовать CLI:

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Перейдите в папку user-creation
cd apps/user-creation

# Запустите деплой
vercel

# Следуйте инструкциям:
# - Link to existing project? No
# - Project name: mm-preview-user-creation
# - Root directory: apps/user-creation
# - Override settings? Yes
# - Build command: turbo run build
# - Output directory: .next
```

После этого проект появится в Vercel Dashboard.

## Проверка конфигурации файлов

Убедитесь, что все файлы на месте:

- ✅ `apps/user-creation/vercel.json` - существует
- ✅ `apps/user-creation/package.json` - существует
- ✅ `apps/user-creation/next.config.ts` - существует
- ✅ `apps/user-creation/app/` или `apps/user-creation/src/` - существует
- ✅ `turbo.json` в корне - существует

## Если ничего не помогает

1. Проверьте логи сборки в Vercel Dashboard - там будет точная ошибка
2. Убедитесь, что landing и dashboard успешно деплоятся
3. Сравните настройки user-creation с настройками landing/dashboard
4. Попробуйте удалить проект в Vercel и создать заново

