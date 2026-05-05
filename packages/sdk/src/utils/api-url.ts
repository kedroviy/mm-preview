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
  // Если NEXT_PUBLIC_API_URL начинается с /, это означает что используется прокси
  // (например, /api/v1 означает что запросы идут через rewrites)
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Проверяем, нужно ли использовать прокси
  const useProxy =
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true" ||
    (process.env.NODE_ENV === "production" &&
      (!publicApiUrl || publicApiUrl.startsWith("/")));

  if (useProxy) {
    // При прокси возвращаем пустую строку, чтобы запросы были относительными к домену
    return "";
  }

  // В разработке возвращаем полный URL бэкенда (без модификации path)
  const apiUrl = publicApiUrl || "http://localhost:4000";
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

  // Fallback на другие переменные или localhost
  return process.env.API_URL || "http://localhost:4000";
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
    baseUrl = process.env.BACKEND_URL || "https://api.moviematch.space";
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

