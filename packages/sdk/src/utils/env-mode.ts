/**
 * Утилита для определения режима работы приложения (development/production)
 * Используется для разделения dev и production переменных
 */

/**
 * Проверяет, работает ли приложение в режиме разработки
 */
export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    (!process.env.NODE_ENV && !process.env.VERCEL)
  );
}

/**
 * Проверяет, работает ли приложение в режиме production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL;
}

/**
 * Получает текущий режим работы
 */
export function getEnvMode(): "development" | "production" {
  return isDevelopment() ? "development" : "production";
}
