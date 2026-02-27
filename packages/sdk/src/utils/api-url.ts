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
 * В продакшене возвращает /api/v1 (проксируется через Vercel rewrites)
 * В разработке возвращает NEXT_PUBLIC_API_URL или localhost
 *
 * Важно: В сгенерированных requests уже есть /api/v1/ в URL,
 * поэтому baseURL должен быть пустым при прокси или содержать полный путь без /api/v1
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
    // При прокси возвращаем пустую строку, так как в requests уже есть /api/v1/
    // Next.js rewrites настроены на /api/v1/:path* → ${BACKEND_URL}/api/v1/:path*
    return "";
  }

  // В разработке возвращаем полный URL без /api/v1, так как в requests уже есть /api/v1/
  const apiUrl = publicApiUrl || "http://localhost:4000";
  // Убираем /api/v1 из конца, если есть, так как в requests уже есть /api/v1/
  return apiUrl.replace(/\/api\/v1\/?$/, "");
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
    return publicApiUrl.replace(/\/api\/v1\/?$/, "");
  }

  // Fallback на другие переменные или localhost
  return process.env.API_URL || "http://localhost:4000";
}

/**
 * Получить URL для подключения к WebSocket namespace /rooms.
 *
 * Production: wss://mm-admin-1.onrender.com/rooms (или BACKEND_URL/rooms)
 * Development: ws://localhost:4000/rooms (или NEXT_PUBLIC_API_URL/rooms)
 */
export function getWebSocketRoomsUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";

  let baseUrl: string;
  if (isProduction) {
    baseUrl = process.env.BACKEND_URL || "https://mm-admin-1.onrender.com";
  } else {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    baseUrl =
      publicApiUrl && !publicApiUrl.startsWith("/")
        ? publicApiUrl.replace(/\/api\/v1\/?$/, "")
        : "http://localhost:4000";
  }

  const host = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const protocol = baseUrl.startsWith("https") ? "wss:" : "ws:";
  return `${protocol}//${host}/rooms`;
}
