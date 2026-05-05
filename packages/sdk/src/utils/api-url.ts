/**
 * Утилита для определения правильного API URL
 *
 * В продакшене (Vercel):
 * - Клиентские запросы используют /api (проксируется через Vercel rewrites)
 * - Серверные запросы (middleware, server components) используют прямой URL
 * - WebSocket использует прямой URL (не может быть проксирован)
 *
 * В разработке:
 * - Все запросы используют NEXT_PUBLIC_API_URL или localhost
 */

/**
 * Получить API URL для клиентских запросов
 * В продакшене может возвращать пустую строку (relative) при прокси
 * В разработке возвращает NEXT_PUBLIC_API_URL или localhost
 *
 * Важно: `movie-match` не использует `/api/v1` префикс.
 */
export function getClientApiUrl(): string {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isProduction = process.env.NODE_ENV === "production";

  // Прокси используем ТОЛЬКО когда это явно указано.
  // В Vercel/Next "production" может быть без rewrites для /auth/* и т.п.,
  // поэтому безопаснее по умолчанию ходить на полный backend URL.
  const useProxy =
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true" ||
    (publicApiUrl ? publicApiUrl.startsWith("/") : false);

  if (useProxy) {
    // При прокси возвращаем пустую строку, чтобы запросы были относительными к домену
    return "";
  }

  // В продакшене по умолчанию используем реальный API домен.
  // В деве — localhost, если переменная не задана.
  const apiUrl =
    publicApiUrl ||
    (isProduction ? "https://movie-api.moviematch.space" : "http://localhost:4000");
  return apiUrl.replace(/\/$/, "");
}

/**
 * Получить API URL для серверных запросов (middleware, server components)
 * Всегда использует прямой URL, так как серверные запросы не проходят через Vercel rewrites
 */
export function getServerApiUrl(): string {
  // Для серверных запросов всегда нужен полный URL бэкенда
  // BACKEND_URL имеет приоритет, так как это серверная переменная
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl) {
    return backendUrl;
  }

  // Если NEXT_PUBLIC_API_URL - это полный URL, используем его
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicApiUrl && !publicApiUrl.startsWith("/")) {
    return publicApiUrl.replace(/\/$/, "");
  }

  // Fallback на другие переменные или дефолтный продовый домен
  return (
    process.env.API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://movie-api.moviematch.space"
      : "http://localhost:4000")
  );
}

/**
 * Получить URL для подключения к WebSocket namespace /rooms.
 *
 * Production: wss://api.moviematch.space/rooms (или BACKEND_URL/rooms)
 * Development: ws://localhost:4000/rooms (или NEXT_PUBLIC_API_URL/rooms)
 */
export function getWebSocketRoomsUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";
  
  let baseUrl: string;
  
  if (isProduction) {
    // В продакшене отдаем приоритет BACKEND_URL, но если его нет — фиксированному адресу
    baseUrl = process.env.BACKEND_URL || "https://movie-api.moviematch.space";
  } else {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    baseUrl = publicApiUrl && !publicApiUrl.startsWith("/")
        ? publicApiUrl.replace(/\/api\/v1\/?$/, "")
        : "http://localhost:4000";
  }

  // Очищаем хост от протоколов и лишних слешей
  const host = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: 
  // Если мы на HTTPS (Production), всегда форсим WSS, иначе браузер заблокирует соединение.
  const protocol = baseUrl.startsWith("https") || isProduction ? "wss:" : "ws:";
  
  return `${protocol}//${host}/rooms`;
}

