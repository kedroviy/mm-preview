import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Получает URL приложения создания пользователя
 * Использует ту же логику, что и constants.ts, но адаптированную для middleware
 */
function getUserCreationUrl(): string {
  // Priority 1: Environment variable
  const envUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
  if (envUrl) {
    return envUrl;
  }

  // Priority 2: Vercel environment
  const vercelUrl = process.env.VERCEL_URL;
  const isVercel = process.env.VERCEL === "1" || !!vercelUrl;

  if (isVercel) {
    const protocol = "https";
    // В production используем moviematch.space
    return `${protocol}://start.moviematch.space`;
  }

  // Priority 3: Development mode
  const isDevMode =
    process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
  if (isDevMode) {
    return "http://localhost:3001";
  }

  // Fallback: production default
  return "https://start.moviematch.space";
}

export async function middleware(request: NextRequest) {
  // Проверяем наличие access_token и refresh_token
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Если обоих токенов нет - редирект на страницу создания пользователя
  if (!accessToken && !refreshToken) {
    const userCreationUrl = getUserCreationUrl();
    const url = request.nextUrl.clone();
    url.href = userCreationUrl;
    return NextResponse.redirect(url);
  }

  // Если хотя бы один токен есть - пропускаем запрос
  return NextResponse.next();
}

// Применяем middleware ко всем маршрутам, кроме статических файлов и API
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
