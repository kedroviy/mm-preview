/**
 * Token storage utilities.
 *
 * `movie-match` backend returns a single JWT in body: `{ token }`.
 * We store it client-side (memory + localStorage). No refresh cookies.
 */

const ACCESS_TOKEN_KEY = "mm_access_token";

let inMemoryAccessToken: string | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getCookie(_name: string): string | null {
  if (typeof document === "undefined") return null;

  // document.cookie format: "k1=v1; k2=v2; ..."
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === _name) {
      const value = rest.join("=");
      return value ? decodeURIComponent(value) : "";
    }
  }

  return null;
}

// export function setCookie(name: string, value: string, days = 30): void {
//   if (typeof document === "undefined") {
//     return;
//   }

//   const expires = new Date();
//   expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

//   // Определяем настройки SameSite на основе разрешенных доменов
//   const hostname = window.location.hostname;
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

//   const cookieConfig = getSameSiteConfig(hostname, apiUrl);

//   const sameSite = cookieConfig.sameSite === "none" ? "None" : "Lax";
//   const secure = cookieConfig.secure ? "Secure;" : "";

//   // biome-ignore lint/suspicious/noDocumentCookie: Standard way to set cookies in browser
//   document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=${sameSite};${secure}`;
// }

export function deleteCookie(_name: string): void {
  // no-op
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (!canUseStorage()) return null;

  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) inMemoryAccessToken = token;
    if (token) return token;

    // Fallback for cross-subdomain navigation:
    // `user-creation` stores JWT in `access_token` cookie.
    const cookieToken = getCookie("access_token");
    if (cookieToken) inMemoryAccessToken = cookieToken;
    return cookieToken;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  inMemoryAccessToken = token;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeAccessToken(): void {
  inMemoryAccessToken = null;
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getRefreshToken(): string | null {
  return null;
}

export function removeRefreshToken(): void {
  // no-op
}

export function removeAllAuthTokens(): void {
  removeAccessToken();
}
