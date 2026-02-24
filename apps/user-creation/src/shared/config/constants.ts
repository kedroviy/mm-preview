/**
 * Application URLs configuration
 * Uses environment variables with fallback to dynamic URL detection
 */

function getAppUrl(key: "LANDING" | "USER_CREATION" | "DASHBOARD"): string {
  const envKey = `NEXT_PUBLIC_${key}_URL`;
  const envValue = process.env[envKey];

  // Priority 1: Environment variable (production)
  if (envValue) {
    return envValue;
  }

  // Dynamic URL detection based on current domain (только на клиенте)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Mode 2: Production - moviematch.space
    if (hostname.includes("moviematch.space")) {
      const appNames: Record<string, string> = {
        LANDING: "moviematch.space",
        USER_CREATION: "start.moviematch.space",
        DASHBOARD: "dashboard.moviematch.space",
      };
      return `https://${appNames[key]}`;
    }

    // Mode 2.1: Production - Vercel (fallback для обратной совместимости)
    if (hostname.includes("vercel.app")) {
      const parts = hostname.split(".");
      const baseDomain =
        parts.length >= 2 ? parts.slice(-2).join(".") : "vercel.app";

      const appNames: Record<string, string> = {
        LANDING: "mm-preview-landing",
        USER_CREATION: "mm-preview-user-creation",
        DASHBOARD: "mm-preview-dashboard",
      };

      return `https://${appNames[key]}.${baseDomain}`;
    }

    // Mode 1: Dev mode - IP address or localhost
    const isDevMode =
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
      hostname === "localhost" ||
      hostname === "127.0.0.1";

    if (isDevMode) {
      const devPorts: Record<string, string> = {
        LANDING: "3000",
        USER_CREATION: "3001",
        DASHBOARD: "3002",
      };
      return `${protocol}//${hostname}:${devPorts[key]}`;
    }
  }

  // На сервере: проверяем Vercel переменные окружения
  const vercelUrl = process.env.VERCEL_URL;
  const isVercel = process.env.VERCEL === "1" || !!vercelUrl;

  if (isVercel) {
    // В Vercel используем VERCEL_URL для определения базового домена
    // Если VERCEL_URL не установлен, используем дефолтный домен vercel.app
    const protocol = "https";
    let baseDomain = "vercel.app";

    if (vercelUrl) {
      // Извлекаем базовый домен из VERCEL_URL (например, mm-preview-user-creation.vercel.app -> vercel.app)
      const parts = vercelUrl.split(".");
      if (parts.length >= 2) {
        baseDomain = parts.slice(-2).join(".");
      }
    }

    const appNames: Record<string, string> = {
      LANDING: "moviematch.space",
      USER_CREATION: "start.moviematch.space",
      DASHBOARD: "dashboard.moviematch.space",
    };

    // Если домен уже полный (moviematch.space), возвращаем его как есть
    if (!appNames[key].includes(".")) {
      return `${protocol}://${appNames[key]}.${baseDomain}`;
    }
    return `${protocol}://${appNames[key]}`;
  }

  // На сервере используем fallback для dev режима
  // Если это не клиент и не установлена env переменная, предполагаем dev режим
  const isDevMode =
    process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
  if (isDevMode) {
    const devPorts: Record<string, string> = {
      LANDING: "3000",
      USER_CREATION: "3001",
      DASHBOARD: "3002",
    };
    // На сервере в dev режиме используем localhost
    return `http://localhost:${devPorts[key]}`;
  }

  // В production на сервере без переменных окружения используем значения по умолчанию для Vercel
  // Это предотвратит ошибки во время сборки, если переменные окружения не установлены
  const protocol = "https";
  const baseDomain = "vercel.app";
  const appNames: Record<string, string> = {
    LANDING: "moviematch.space",
    USER_CREATION: "start.moviematch.space",
    DASHBOARD: "dashboard.moviematch.space",
  };

  // Если домен уже полный (moviematch.space), возвращаем его как есть
  if (!appNames[key].includes(".")) {
    return `${protocol}://${appNames[key]}.${baseDomain}`;
  }
  return `${protocol}://${appNames[key]}`;
}

// Export as a function to get URLs dynamically
export function getAppUrls() {
  return {
    LANDING: getAppUrl("LANDING"),
    USER_CREATION: getAppUrl("USER_CREATION"),
    DASHBOARD: getAppUrl("DASHBOARD"),
  } as const;
}

// For backward compatibility, export as object (will be evaluated at module load time)
// Note: This will use fallback values if env vars are not set during build
export const APP_URLS = getAppUrls();
