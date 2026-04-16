import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  detectLanguage,
} from "@/src/shared/config/metadata";

function hasLocalePrefix(pathname: string): boolean {
  return SUPPORTED_LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function getLocaleFromPathname(pathname: string): SupportedLocale | null {
  const part = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(part as SupportedLocale)) {
    return part as SupportedLocale;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/robots") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  if (hasLocalePrefix(pathname)) {
    const locale = getLocaleFromPathname(pathname);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-mm-lang", locale ?? DEFAULT_LOCALE);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const acceptLanguage = request.headers.get("accept-language");
  const lang = detectLanguage(pathname, acceptLanguage) ?? DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next).*)"],
};

