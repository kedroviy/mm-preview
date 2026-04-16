import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLanguage,
} from "@/src/shared/config/metadata";

const LANDING_SEGMENT_LOCALE_COOKIE = "mm_landing_segment_locale";

function hasLocalePrefix(pathname: string): boolean {
  return SUPPORTED_LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function withSegmentLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LANDING_SEGMENT_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptLanguage = request.headers.get("accept-language");
  const segmentLocale =
    detectLanguage(pathname, acceptLanguage) ?? DEFAULT_LOCALE;
  const existingSegmentLocale = request.cookies.get(
    LANDING_SEGMENT_LOCALE_COOKIE,
  )?.value;

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
    const response = NextResponse.next();
    if (existingSegmentLocale) {
      return response;
    }
    return withSegmentLocaleCookie(response, segmentLocale);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${segmentLocale}${pathname === "/" ? "" : pathname}`;
  return withSegmentLocaleCookie(NextResponse.redirect(url), segmentLocale);
}

export const config = {
  matcher: ["/((?!_next).*)"],
};

