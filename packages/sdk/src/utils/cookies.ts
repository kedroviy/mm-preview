/**
 * Утилиты для работы с куками на клиенте
 */

const COOKIE_NAME = "access_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // biome-ignore lint/suspicious/noDocumentCookie: Standard way to set cookies in browser
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Standard way to delete cookies in browser
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getAccessToken(): string | null {
  return getCookie(COOKIE_NAME);
}

export function setAccessToken(token: string): void {
  setCookie(COOKIE_NAME, token);
}

export function removeAccessToken(): void {
  deleteCookie(COOKIE_NAME);
}
