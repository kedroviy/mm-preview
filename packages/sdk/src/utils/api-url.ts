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
    (process.env.NODE_ENV === "production" && (!publicApiUrl || publicApiUrl.startsWith("/")));
  
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
 * Получить WebSocket URL
 * Всегда использует прямой URL, так как WebSocket не может быть проксирован через rewrites
 */
export function getWebSocketUrl(): string {
  // WebSocket всегда использует прямой URL бэкенда
  // BACKEND_URL имеет приоритет
  let apiUrl = process.env.BACKEND_URL;
  
  if (!apiUrl) {
    // Если NEXT_PUBLIC_API_URL - это полный URL, используем его
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (publicApiUrl && !publicApiUrl.startsWith("/")) {
      apiUrl = publicApiUrl.replace(/\/api\/v1\/?$/, "");
    } else {
      apiUrl = "http://localhost:4000";
    }
  }
  
  const wsUrl = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
  return `${wsProtocol}//${wsUrl}/rooms`;
}

