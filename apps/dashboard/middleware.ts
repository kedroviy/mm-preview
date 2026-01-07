import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getAppUrl(): string {
  const envValue = process.env.NEXT_PUBLIC_USER_CREATION_URL;

  if (envValue) {
    return envValue;
  }

  // Fallback to local development URL
  return "http://user-creation.local";
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");

  // Если токена нет, редиректим на страницу создания пользователя
  if (!token) {
    const userCreationUrl = getAppUrl();
    return NextResponse.redirect(new URL(userCreationUrl));
  }

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
