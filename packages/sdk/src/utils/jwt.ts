/**
 * Утилиты для работы с JWT токенами
 */

/**
 * Декодирует JWT токен и возвращает payload
 * Внимание: это только декодирование, без проверки подписи!
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Получает userId из JWT токена
 */
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  // JWT может содержать userId в разных полях
  return decoded.userId || decoded.sub || decoded.id || null;
}

