import { NextResponse } from "next/server";

export function middleware() {
  // JWT хранится в localStorage (к нему нет доступа из middleware).
  // Поэтому middleware больше не выполняет редиректы и refresh-логику.
  return NextResponse.next();
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
