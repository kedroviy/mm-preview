import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getDashboardUrl(request: NextRequest): string {
  const envValue = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  if (envValue) {
    return envValue;
  }

  // Try to detect URL from request
  const hostname = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || 
                   (request.url.startsWith("https") ? "https" : "http");
  
  // Extract hostname without port
  const hostnameWithoutPort = hostname.split(":")[0];
  
  // Check if we're in dev mode with IP address
  const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort) || 
                       hostnameWithoutPort === "localhost" || 
                       hostnameWithoutPort === "127.0.0.1";
  
  if (isIPAddress) {
    return `${protocol}://${hostnameWithoutPort}:3002`;
  }

  // If no environment variable and not in dev mode, throw error
  // Environment variable must be set for production
  throw new Error(`NEXT_PUBLIC_DASHBOARD_URL must be set for non-dev environments`);
}

export async function middleware(request: NextRequest) {
  // Проверяем, что мы на странице user-creation (корневой путь)
  const pathname = request.nextUrl.pathname;
  const isUserCreationPage = pathname === "/";

  // Если не на странице создания пользователя, пропускаем
  if (!isUserCreationPage) {
    return NextResponse.next();
  }

  // Проверяем access_token в куках
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  // Middleware работает на сервере, используем прямой URL (не прокси)
  const { getServerApiUrl } = await import("@mm-preview/sdk");
  const apiUrl = getServerApiUrl();

  if (!accessToken?.value) {
    if (!refreshToken?.value) {
      // Нет ни access_token, ни refresh_token - показываем форму
      return NextResponse.next();
    } else {
      // Есть refresh_token, но нет access_token - пытаемся обновить
      try {
        const refreshCookieString = `refresh_token=${refreshToken.value}`;
        
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: refreshCookieString,
            Origin: request.headers.get("origin") || request.url.split("/").slice(0, 3).join("/"),
          },
          credentials: "include",
          cache: "no-store",
        });

        if (refreshResponse.ok) {
          // Получаем новый access_token из Set-Cookie
          const setCookieHeaders = refreshResponse.headers.getSetCookie();
          let newAccessToken: string | null = null;
          
          for (const cookie of setCookieHeaders) {
            const accessMatch = cookie.match(/access_token=([^;]+)/);
            if (accessMatch) {
              newAccessToken = accessMatch[1];
              break;
            }
          }
          
          if (newAccessToken) {
            // Декодируем новый access_token и извлекаем userId
            const { decodeJWT } = await import("@mm-preview/sdk");
            const decoded = decodeJWT(newAccessToken);
            const userId = decoded?.sub || decoded?.userId;
            
            if (userId && typeof userId === "string") {
              const dashboardUrl = getDashboardUrl(request);
              console.log("[user-creation middleware] Token refreshed, redirecting to dashboard with userId:", userId);
              return NextResponse.redirect(new URL(`${dashboardUrl}/${userId}`));
            }
          }
        } else {
          // Refresh не удался (refresh_token невалидный) - очищаем refresh_token и показываем форму
          console.log("[user-creation middleware] Refresh failed, clearing refresh_token and showing form");
          const response = NextResponse.next();
          response.cookies.delete("refresh_token");
          return response;
        }
      } catch (error) {
        // Ошибка при refresh - очищаем refresh_token и показываем форму
        console.error("[user-creation middleware] Error refreshing token:", error);
        const response = NextResponse.next();
        response.cookies.delete("refresh_token");
        return response;
      }
      
      // Если refresh не удался или не получили userId, очищаем refresh_token и показываем форму
      const nextResponse = NextResponse.next();
      nextResponse.cookies.delete("refresh_token");
      return nextResponse;
    }
  }
  if (accessToken?.value) {
    try {
      const { decodeJWT } = await import("@mm-preview/sdk");
      const decoded = decodeJWT(accessToken.value);
      
      // Извлекаем userId из поля sub (стандартное поле JWT для subject/userId)
      const userId = decoded?.sub || decoded?.userId;
      
      if (userId && typeof userId === "string") {
        const dashboardUrl = getDashboardUrl(request);
        console.log("[user-creation middleware] Access token found, redirecting to dashboard with userId:", userId);
        return NextResponse.redirect(new URL(`${dashboardUrl}/${userId}`));
      }
    } catch (error) {
      // Если токен невалидный, просто показываем форму
      console.error("[user-creation middleware] Invalid access token:", error);
    }
  }

  // Если нет access_token, показываем форму создания
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

