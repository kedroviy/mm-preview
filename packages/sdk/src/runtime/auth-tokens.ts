import { decodeJWT, getCookieDomain } from "./token-utils";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function readCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return m ? decodeURIComponent(m[1]) : null;
}

/** Client-side access token from shared cookie (user-creation sets `access_token`). */
export function getAccessToken(): string | null {
	return readCookie(ACCESS_COOKIE);
}

/** Clears auth cookies on the current host (and parent domain when applicable). */
export function removeAllAuthTokens(): void {
	if (typeof document === "undefined") return;
	const domain = getCookieDomain(window.location.hostname);
	const domainPart = domain ? `; domain=${domain}` : "";
	const secure =
		window.location.protocol === "https:" ? "; Secure" : "";
	const expire = "; path=/; max-age=0";
	document.cookie = `${ACCESS_COOKIE}=${expire}${domainPart}${secure}`;
	document.cookie = `${REFRESH_COOKIE}=${expire}${domainPart}${secure}`;
}

/** Best-effort user id from JWT payload (same claims as user-creation). */
export function getUserIdFromToken(token: string | null | undefined): string | null {
	if (!token) return null;
	const decoded = decodeJWT(token);
	const userId = decoded?.sub ?? decoded?.userId ?? decoded?.id;
	if (typeof userId === "string" || typeof userId === "number") {
		return String(userId);
	}
	return null;
}
