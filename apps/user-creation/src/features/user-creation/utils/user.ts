import { decodeJWT } from "@mm-preview/sdk";

export function getUserIdFromAccessToken(token: string): string | null {
  const decoded = decodeJWT(token);
  const userId = decoded?.sub ?? decoded?.userId ?? decoded?.id;

  if (typeof userId === "string" || typeof userId === "number") {
    return String(userId);
  }

  return null;
}

export function saveAccessToken(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Access token must be readable by middleware on subsequent requests
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
}
