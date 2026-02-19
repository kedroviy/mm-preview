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
 * В продакшене возвращает /api (проксируется через Vercel)
 * В разработке возвращает NEXT_PUBLIC_API_URL или localhost
 */
export function getClientApiUrl(): string {
  // Можно принудительно включить прокси через переменную окружения
  const useProxy = 
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true" ||
    (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL);
  
  if (useProxy) {
    return "/api";
  }
  
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

/**
 * Получить API URL для серверных запросов (middleware, server components)
 * Всегда использует прямой URL, так как серверные запросы не проходят через Vercel rewrites
 */
export function getServerApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.API_URL || 
         "http://localhost:4000";
}

/**
 * Получить WebSocket URL
 * Всегда использует прямой URL, так как WebSocket не может быть проксирован через rewrites
 */
export function getWebSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const wsUrl = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
  return `${wsProtocol}//${wsUrl}/rooms`;
}

