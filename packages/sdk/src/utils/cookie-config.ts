/**
 * Конфигурация для работы с куки в кросс-доменных запросах
 * Определяет, какие домены разрешены для использования SameSite=None
 */

/**
 * Получает список разрешенных доменов из переменных окружения
 * Формат: ALLOWED_COOKIE_DOMAINS=domain1.com,domain2.com,*.vercel.app
 */
function getAllowedDomains(): string[] {
  const envValue = process.env.ALLOWED_COOKIE_DOMAINS;
  if (envValue) {
    return envValue.split(",").map((domain) => domain.trim());
  }

  // Дефолтные разрешенные домены для production
  const defaultDomains = [
    "*.vercel.app", // Все поддомены Vercel (mm-preview-user-creation.vercel.app, mm-preview-dashboard.vercel.app и т.д.)
    "vercel.app", // Базовый домен Vercel
    "localhost",
    "127.0.0.1",
  ];

  return defaultDomains;
}

/**
 * Получает список разрешенных URL из переменных окружения
 * Формат: ALLOWED_COOKIE_URLS=https://api.example.com,https://backend.vercel.app
 */
function getAllowedUrls(): string[] {
  const envValue = process.env.ALLOWED_COOKIE_URLS;
  if (envValue) {
    return envValue.split(",").map((url) => url.trim());
  }

  // Дефолтные разрешенные URL (из NEXT_PUBLIC_API_URL)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    return [apiUrl];
  }

  return [];
}

/**
 * Проверяет, соответствует ли домен паттерну (поддерживает wildcards)
 */
function matchesDomainPattern(hostname: string, pattern: string): boolean {
  // Точное совпадение
  if (hostname === pattern) {
    return true;
  }

  // Wildcard в начале: *.example.com
  if (pattern.startsWith("*.")) {
    const domain = pattern.slice(2);
    return hostname.endsWith(`.${domain}`) || hostname === domain;
  }

  // Wildcard в конце: example.*
  if (pattern.endsWith(".*")) {
    const domain = pattern.slice(0, -2);
    return hostname.startsWith(`${domain}.`);
  }

  // Частичное совпадение (для обратной совместимости)
  return hostname.includes(pattern) || pattern.includes(hostname);
}

/**
 * Проверяет, разрешен ли домен для кросс-доменных куки
 */
export function isAllowedDomain(hostname: string): boolean {
  const allowedDomains = getAllowedDomains();
  const hostnameWithoutPort = hostname.split(":")[0];

  return allowedDomains.some((pattern) =>
    matchesDomainPattern(hostnameWithoutPort, pattern),
  );
}

/**
 * Проверяет, разрешен ли URL для кросс-доменных куки
 */
export function isAllowedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return isAllowedDomain(urlObj.hostname);
  } catch {
    return false;
  }
}

/**
 * Определяет, нужно ли использовать SameSite=None для куки
 * Возвращает true, если запрос кросс-доменный и домен разрешен
 */
export function shouldUseSameSiteNone(
  requestHost: string,
  apiUrl: string,
): boolean {
  // В dev режиме не используем SameSite=None
  const isDev =
    process.env.NODE_ENV === "development" ||
    (!process.env.NODE_ENV && !process.env.VERCEL);

  if (isDev) {
    return false;
  }

  // Проверяем, являются ли домены разными
  try {
    const apiHost = new URL(apiUrl).hostname;
    const requestHostname = requestHost.split(":")[0];

    // Если домены одинаковые, не нужен SameSite=None
    if (apiHost === requestHostname) {
      return false;
    }

    // Проверяем, разрешен ли API домен
    if (!isAllowedDomain(apiHost)) {
      return false;
    }

    // Проверяем, разрешен ли домен приложения
    if (!isAllowedDomain(requestHostname)) {
      return false;
    }

    // Если оба домена разрешены и они разные - используем SameSite=None
    return true;
  } catch {
    // Если не удалось распарсить URL, не используем SameSite=None
    return false;
  }
}

/**
 * Получает настройки SameSite для куки
 */
export function getSameSiteConfig(
  requestHost: string,
  apiUrl: string,
): {
  sameSite: "strict" | "lax" | "none";
  secure: boolean;
} {
  const useNone = shouldUseSameSiteNone(requestHost, apiUrl);

  return {
    sameSite: useNone ? "none" : "lax",
    secure: useNone, // SameSite=None требует Secure
  };
}

