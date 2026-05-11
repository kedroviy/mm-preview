import { decodeJWT, getCookieDomain } from "@mm-preview/sdk";

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

  const maxAgeSeconds = 30 * 24 * 60 * 60;

  // Make cookie available across subdomains (start./dashboard./api.) on moviematch.space.
  const cookieDomain = getCookieDomain(window.location.hostname);
  const domainPart = cookieDomain ? `; domain=${cookieDomain}` : "";

  const isSecure = window.location.protocol === "https:";
  const securePart = isSecure ? "; Secure" : "";

  // biome-ignore lint/suspicious/noDocumentCookie: Token must be stored in a cookie for cross-app navigation.
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${domainPart}${securePart}`;
}
