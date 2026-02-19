/**
 * Утилиты для синхронизации токенов между localStorage и cookies
 * Используется для передачи токенов между разными портами в dev режиме
 */

const ACCESS_TOKEN_KEY = "mm_preview_access_token";
const REFRESH_TOKEN_KEY = "mm_preview_refresh_token";

/**
 * Сохраняет токены в localStorage (для передачи между портами в dev режиме)
 */
export function saveTokensToStorage(
  accessToken: string,
  refreshToken: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Failed to save tokens to localStorage:", error);
  }
}

/**
 * Получает токены из localStorage
 */
export function getTokensFromStorage(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  try {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  } catch (error) {
    console.error("Failed to get tokens from localStorage:", error);
    return { accessToken: null, refreshToken: null };
  }
}

/**
 * Удаляет токены из localStorage
 */
export function removeTokensFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove tokens from localStorage:", error);
  }
}

/**
 * Синхронизирует токены из localStorage в cookies
 * Используется при загрузке страницы для восстановления токенов
 */
export function syncTokensFromStorageToCookies(): void {
  if (typeof window === "undefined") {
    return;
  }

  const { accessToken, refreshToken } = getTokensFromStorage();

  if (accessToken) {
    const { setCookie } = require("./cookies");
    setCookie("access_token", accessToken);
  }

  if (refreshToken) {
    const { setCookie } = require("./cookies");
    setCookie("refresh_token", refreshToken);
  }
}

/**
 * Проверяет, находимся ли мы в dev режиме
 */
function isDevMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    (!process.env.NODE_ENV && !process.env.VERCEL)
  );
}

/**
 * Синхронизирует токены из cookies в localStorage (для передачи между портами)
 */
export function syncTokensFromCookiesToStorage(): void {
  if (typeof window === "undefined" || !isDevMode()) {
    return;
  }

  try {
    const { getCookie } = require("./cookies");
    const accessToken = getCookie("access_token");
    const refreshToken = getCookie("refresh_token");

    if (accessToken || refreshToken) {
      if (accessToken) {
        try {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        } catch (error) {
          console.error("Failed to save access token to localStorage:", error);
        }
      }

      if (refreshToken) {
        try {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        } catch (error) {
          console.error("Failed to save refresh token to localStorage:", error);
        }
      }
    }
  } catch (error) {
    // Игнорируем ошибки, если cookies недоступны (например, HttpOnly)
    // В этом случае токены уже установлены бэкендом через Set-Cookie
  }
}

