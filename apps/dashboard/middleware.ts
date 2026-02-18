import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getUserCreationUrl(request: NextRequest): string {
  const envValue = process.env.NEXT_PUBLIC_USER_CREATION_URL;

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

  // Check for Vercel deployment
  if (hostnameWithoutPort.includes("vercel.app")) {
    // For Vercel, base domain is always the last two parts: "vercel.app"
    const parts = hostnameWithoutPort.split(".");
    const baseDomain =
      parts.length >= 2
        ? parts
            .slice(-2)
            .join(".") // Always take last two parts: "vercel.app"
        : "vercel.app"; // Fallback

    return `https://mm-preview-user-creation.${baseDomain}`;
  }

  // Check if we're in dev mode with IP address
  const isIPAddress =
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort) ||
    hostnameWithoutPort === "localhost" ||
    hostnameWithoutPort === "127.0.0.1";

  // Check if port is in hostname (dev mode) - ports like 3000, 3001, 3002
  const hasPort = hostname.includes(":") && /:\d{4}/.test(hostname);

  if (isIPAddress) {
    // If we have IP address, use dev port 3001 for user-creation
    // Check if port is in hostname, if not, extract from URL
    if (hasPort) {
      return `${protocol}://${hostnameWithoutPort}:3001`;
    }
    // If no port in hostname, try to extract from request URL
    const urlMatch = request.url.match(/:(\d{4})/);
    if (urlMatch) {
      return `${protocol}://${hostnameWithoutPort}:3001`;
    }
    // Default to port 3001 for dev mode
    return `${protocol}://${hostnameWithoutPort}:3001`;
  }

  // If no environment variable and not in dev mode, throw error
  // Environment variable must be set for production
  throw new Error(
    "NEXT_PUBLIC_USER_CREATION_URL must be set for non-dev environments",
  );
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // Если есть access_token, проверяем его валидность
  if (accessToken?.value) {
    try {
      const { decodeJWT } = await import("@mm-preview/sdk");
      const decoded = decodeJWT(accessToken.value);
      // Если токен валидный и содержит userId, пропускаем
      if (decoded?.userId) {
        return NextResponse.next();
      }
    } catch (error) {
      // Токен невалидный, продолжаем проверку refresh_token
      console.error("Invalid access token:", error);
    }
  }

  // Если нет валидного access_token, проверяем refresh_token
  if (refreshToken?.value) {
    // Проверяем валидность refresh_token
    let isRefreshTokenValid = false;
    try {
      const { decodeJWT } = await import("@mm-preview/sdk");
      const decoded = decodeJWT(refreshToken.value);
      if (decoded?.userId) {
        isRefreshTokenValid = true;
      }
    } catch (error) {
      console.error("Invalid refresh token:", error);
    }

    // Если refresh_token невалидный, редиректим на страницу входа
    if (!isRefreshTokenValid) {
      const userCreationUrl = getUserCreationUrl(request);
      const redirectResponse = NextResponse.redirect(new URL(userCreationUrl));
      redirectResponse.cookies.delete("access_token");
      redirectResponse.cookies.delete("refresh_token");
      return redirectResponse;
    }

    // Если refresh_token валидный, пытаемся обновить access_token
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
          Origin:
            request.headers.get("origin") ||
            request.url.split("/").slice(0, 3).join("/"),
        },
        credentials: "include",
      });

      if (response.ok) {
        // Получаем Set-Cookie заголовки и устанавливаем куки
        const setCookieHeaders = response.headers.getSetCookie();
        const responseWithCookies = NextResponse.next();

        // Определяем, является ли запрос кросс-доменным (production на Vercel)
        const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
        const requestHost = request.headers.get("host") || "";
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        
        // Проверяем, является ли запрос кросс-доменным
        // В production на Vercel приложения работают на vercel.app, а API может быть на другом домене
        let isCrossDomain = false;
        if (isProduction) {
          try {
            const apiHost = new URL(apiUrl).hostname;
            const requestHostname = requestHost.split(":")[0]; // Убираем порт
            // Если домены разные, это кросс-доменный запрос
            isCrossDomain = apiHost !== requestHostname && 
                           !requestHostname.includes(apiHost) && 
                           !apiHost.includes(requestHostname);
          } catch {
            // Если не удалось распарсить URL, предполагаем кросс-доменный запрос в production
            isCrossDomain = true;
          }
        }

        // Устанавливаем куки из Set-Cookie заголовков
        for (const cookieHeader of setCookieHeaders) {
          const nameMatch = cookieHeader.match(/^([^=]+)=([^;]+)/);
          if (nameMatch) {
            const cookieName = nameMatch[1];
            const cookieValue = nameMatch[2];

            // Парсим атрибуты куки
            const pathMatch = cookieHeader.match(/Path=([^;]+)/);
            const domainMatch = cookieHeader.match(/Domain=([^;]+)/);
            const maxAgeMatch = cookieHeader.match(/Max-Age=([^;]+)/);
            const httpOnlyMatch = cookieHeader.match(/HttpOnly/);
            const secureMatch = cookieHeader.match(/Secure/);
            const sameSiteMatch = cookieHeader.match(/SameSite=([^;]+)/);

            // Для кросс-доменных запросов в production используем SameSite=None; Secure
            let sameSite: "strict" | "lax" | "none" = sameSiteMatch
              ? (sameSiteMatch[1].toLowerCase() as "strict" | "lax" | "none")
              : "lax";
            let secure = !!secureMatch;

            if (isCrossDomain) {
              sameSite = "none";
              secure = true; // SameSite=None требует Secure
            }

            responseWithCookies.cookies.set(cookieName, cookieValue, {
              path: pathMatch ? pathMatch[1] : "/",
              domain: domainMatch ? domainMatch[1] : undefined,
              maxAge: maxAgeMatch
                ? Number.parseInt(maxAgeMatch[1], 10)
                : undefined,
              httpOnly: !!httpOnlyMatch,
              secure,
              sameSite,
            });
          }
        }

        return responseWithCookies;
      } else {
        // Refresh не удался - очищаем куки и редиректим
        const userCreationUrl = getUserCreationUrl(request);
        const redirectResponse = NextResponse.redirect(
          new URL(userCreationUrl),
        );
        redirectResponse.cookies.delete("access_token");
        redirectResponse.cookies.delete("refresh_token");
        return redirectResponse;
      }
    } catch (error) {
      console.error("Error refreshing token in middleware:", error);
      const userCreationUrl = getUserCreationUrl(request);
      const redirectResponse = NextResponse.redirect(new URL(userCreationUrl));
      redirectResponse.cookies.delete("access_token");
      redirectResponse.cookies.delete("refresh_token");
      return redirectResponse;
    }
  }

  // Если нет refresh_token, редиректим на страницу создания пользователя
  const userCreationUrl = getUserCreationUrl(request);
  return NextResponse.redirect(new URL(userCreationUrl));
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
