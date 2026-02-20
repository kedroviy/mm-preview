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
    "moviematch.space", // Основной домен
    "*.moviematch.space", // Все поддомены (start.moviematch.space, dashboard.moviematch.space и т.д.)
    "*.vercel.app", // Все поддомены Vercel (для обратной совместимости)
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
 * Проверяет, является ли домен localhost (для dev режима)
 */
function isLocalhost(hostname: string): boolean {
  const hostnameWithoutPort = hostname.split(":")[0];
  return (
    hostnameWithoutPort === "localhost" ||
    hostnameWithoutPort === "127.0.0.1" ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort)
  );
}

/**
 * Определяет, нужно ли использовать SameSite=None для куки
 * Возвращает true, если запрос кросс-доменный и домен разрешен
 */
export function shouldUseSameSiteNone(
  requestHost: string,
  apiUrl: string,
): boolean {
  const isDev =
    process.env.NODE_ENV === "development" ||
    (!process.env.NODE_ENV && !process.env.VERCEL);

  // Проверяем, являются ли домены разными
  try {
    const apiHost = new URL(apiUrl).hostname;
    const requestHostname = requestHost.split(":")[0];

    // Если домены одинаковые, не нужен SameSite=None
    if (apiHost === requestHostname) {
      return false;
    }

    // В dev режиме на localhost используем SameSite=None для кросс-портовых запросов
    // Браузеры делают исключение для localhost и позволяют SameSite=None без Secure
    if (isDev && isLocalhost(requestHostname) && isLocalhost(apiHost)) {
      return true;
    }

    // В production проверяем, разрешен ли домен
    if (!isDev) {
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
    }

    // В dev режиме для не-localhost доменов не используем SameSite=None
    return false;
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
  const requestHostname = requestHost.split(":")[0];
  const isDev =
    process.env.NODE_ENV === "development" ||
    (!process.env.NODE_ENV && !process.env.VERCEL);

  // Для localhost в dev режиме SameSite=None работает без Secure
  // Браузеры делают исключение для localhost
  const isLocalhostDev = isDev && isLocalhost(requestHostname);

  return {
    sameSite: useNone ? "none" : "lax",
    // SameSite=None требует Secure, но для localhost в dev режиме можно без Secure
    secure: useNone && !isLocalhostDev,
  };
}

/**
 * Получает домен для кук, чтобы они работали между поддоменами
 * Для moviematch.space поддоменов возвращает ".moviematch.space"
 * Для Vercel поддоменов возвращает ".vercel.app"
 */
export function getCookieDomain(hostname: string): string | undefined {
  const hostnameWithoutPort = hostname.split(":")[0];
  
  // Проверяем, находимся ли мы на moviematch.space
  if (hostnameWithoutPort.endsWith(".moviematch.space") || hostnameWithoutPort === "moviematch.space") {
    // Для moviematch.space поддоменов используем общий домен ".moviematch.space"
    // Точка в начале означает, что куки будут доступны для всех поддоменов
    return ".moviematch.space";
  }
  
  // Проверяем, находимся ли мы на Vercel
  if (hostnameWithoutPort.endsWith(".vercel.app")) {
    // Для Vercel поддоменов используем общий домен ".vercel.app"
    // Точка в начале означает, что куки будут доступны для всех поддоменов
    return ".vercel.app";
  }
  
  // // Для localhost и IP адресов не устанавливаем домен
  // // Браузеры автоматически делают куки доступными для всех портов на localhost
  // // Указание domain: "localhost" может вызвать проблемы в некоторых браузерах
  // if (
  //   hostnameWithoutPort === "localhost" ||
  //   hostnameWithoutPort === "127.0.0.1" ||
  //   /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort)
  // ) {
  //   return undefined;
  // }
  
  // Для других доменов можно попробовать извлечь базовый домен
  // Но это сложно, поэтому возвращаем undefined
  return undefined;
}

