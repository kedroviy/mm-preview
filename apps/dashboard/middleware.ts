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

export function middleware() {
  // JWT хранится в localStorage (к нему нет доступа из middleware).
  // Поэтому auth guard выполняется на клиенте.
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
