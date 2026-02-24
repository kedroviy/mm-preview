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
 * Получить WebSocket URL для Socket.IO
 *
 * Socket.IO автоматически добавляет /socket.io/ к базовому URL, поэтому
 * нужно передавать только базовый URL без пути.
 *
 * В продакшене (Vercel): использует прямой URL к бэкенду (wss://mm-admin-1.onrender.com)
 * Протокол определяется автоматически на основе window.location.protocol (wss:// для HTTPS)
 *
 * ВАЖНО: Vercel не поддерживает WebSocket через rewrites, поэтому в продакшене
 * всегда используется прямой URL к бэкенду с правильным протоколом.
 *
 * В локальной разработке:
 * - Если используется прокси (NEXT_PUBLIC_USE_API_PROXY=true), использует относительный URL ""
 *   Socket.IO автоматически определит протокол (ws:// для localhost) и добавит /socket.io/
 * - Иначе использует прямой URL к бэкенду (ws://localhost:4000)
 */
export function getWebSocketUrl(): string {
  // Проверяем, нужно ли использовать прокси (только для локальной разработки)
  const useProxy =
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true" &&
    process.env.NODE_ENV !== "production";

  // В продакшене на Vercel всегда используем прямой URL к бэкенду
  // так как Vercel не поддерживает WebSocket через rewrites
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction || !useProxy) {
    // Используем прямой URL к бэкенду
    // BACKEND_URL имеет приоритет
    let apiUrl = process.env.BACKEND_URL;

    if (!apiUrl) {
      // Если NEXT_PUBLIC_API_URL - это полный URL, используем его
      const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (publicApiUrl && !publicApiUrl.startsWith("/")) {
        apiUrl = publicApiUrl.replace(/\/api\/v1\/?$/, "");
      } else if (isProduction) {
        // В продакшене, если переменные не установлены, используем дефолтный URL бэкенда
        // Это fallback для случая, когда BACKEND_URL не установлен в Vercel
        apiUrl = "https://mm-admin-1.onrender.com";
      } else {
        // В разработке используем localhost
        apiUrl = "http://localhost:4000";
      }
    }

    // Определяем протокол автоматически на основе текущего протокола страницы
    // Это важно для правильного определения wss:// вместо ws://
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      // Socket.IO использует свой путь /socket.io/, поэтому возвращаем базовый URL
      // Socket.IO сам добавит /socket.io/ к URL
      return `${protocol}//${wsUrl}`;
    }

    // На сервере определяем протокол на основе URL
    const wsUrl = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
    // Socket.IO использует свой путь /socket.io/, поэтому возвращаем базовый URL
    return `${wsProtocol}//${wsUrl}`;
  }

  // В локальной разработке с прокси используем относительный URL
  // Socket.IO автоматически определит протокол (ws:// для localhost)
  // Socket.IO сам добавит /socket.io/ к URL
  return "";
}

/**
 * Получить URL для подключения к WebSocket namespace /rooms
 * Бэкенд использует Socket.IO с namespace `/rooms` — клиент должен подключаться к этому пути.
 * Возвращает полный URL (например wss://host/rooms) или относительный '/rooms' при прокси.
 */
export function getWebSocketRoomsUrl(): string {
  const base = getWebSocketUrl();
  return base ? `${base}/rooms` : "/rooms";
}
