import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getDashboardUrl(request: NextRequest): string {
  const envValue = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  if (envValue) {
    return envValue;
  }

  // Try to detect URL from request
  const hostname = request.headers.get("host") || "";
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https") ? "https" : "http");

  // Extract hostname without port
  const hostnameWithoutPort = hostname.split(":")[0];

  // Check if we're in dev mode with IP address
  const isIPAddress =
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort) ||
    hostnameWithoutPort === "localhost" ||
    hostnameWithoutPort === "127.0.0.1";

  if (isIPAddress) {
    return `${protocol}://${hostnameWithoutPort}:3002`;
  }

  // If no environment variable and not in dev mode, throw error
  // Environment variable must be set for production
  throw new Error(
    "NEXT_PUBLIC_DASHBOARD_URL must be set for non-dev environments",
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthPage =
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register";

  // 1. Применяем логику только к auth-страницам
  if (!isAuthPage) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // 2. Сценарий: Токенов нет вообще — ничего не делаем, показываем форму
  if (!accessToken && !refreshToken) {
    return NextResponse.next();
  }

  const { decodeJWT } = await import("@mm-preview/sdk");

  // When frontend and backend are on the same domain, prefer the current origin
  // (still allow explicit NEXT_PUBLIC_API_URL if it exists).
  const apiBase =
    typeof process !== "undefined" &&
    typeof process.env !== "undefined" &&
    process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
      : request.nextUrl.origin;

  // 3. Сценарий: Есть валидный Access Token — сразу редирект
  if (accessToken) {
    const decoded = decodeJWT(accessToken);
    const userId =
      decoded?.sub ?? decoded?.userId ?? decoded?.id ?? undefined;

    if (userId !== undefined && userId !== null && `${userId}`.length > 0) {
      const dashboardUrl = getDashboardUrl(request);
      return NextResponse.redirect(
        new URL(`${dashboardUrl}/${userId}`, request.url),
      );
    }
  }

  // 4. movie-match has no refresh-token flow; ignore orphan refresh cookies.

  // 5. Если мы здесь — токены были, но они битые. Чистим и показываем форму.
  const response = NextResponse.next();
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
