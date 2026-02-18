/**
 * Утилиты для работы с куками на клиенте
 */

const COOKIE_NAME = "access_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  // Проверяем все cookies для отладки
  const allCookies = document.cookie;

  // Пробуем стандартный способ
  const value = `; ${allCookies}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift()?.trim();
    if (cookieValue) {
      return cookieValue;
    }
  }

  // Если не нашли, пробуем альтернативный способ (на случай если есть пробелы)
  const cookies = allCookies.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim());
    if (cookieName === name && cookieValue) {
      return cookieValue;
    }
  }

  return null;
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Определяем, является ли это production окружением
  // Проверяем hostname на наличие vercel.app или других production доменов
  const hostname = window.location.hostname;
  const isProduction = hostname.includes("vercel.app") || 
                       (!hostname.includes("localhost") && 
                        !hostname.includes("127.0.0.1") &&
                        !/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname));
  
  // Для production используем SameSite=None; Secure для кросс-доменных куки
  // Для dev используем SameSite=Lax
  const sameSite = isProduction ? "None" : "Lax";
  const secure = isProduction ? "Secure;" : "";

  // biome-ignore lint/suspicious/noDocumentCookie: Standard way to set cookies in browser
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=${sameSite};${secure}`;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Standard way to delete cookies in browser
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getAccessToken(): string | null {
  const token = getCookie(COOKIE_NAME);
  return token;
}

export function setAccessToken(token: string): void {
  setCookie(COOKIE_NAME, token);
}

export function removeAccessToken(): void {
  deleteCookie(COOKIE_NAME);
}

const REFRESH_COOKIE_NAME = "refresh_token";

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE_NAME);
}

export function removeRefreshToken(): void {
  deleteCookie(REFRESH_COOKIE_NAME);
}

export function removeAllAuthTokens(): void {
  removeAccessToken();
  removeRefreshToken();
}
