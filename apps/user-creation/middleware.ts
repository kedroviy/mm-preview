import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decodeJWT } from "@mm-preview/sdk";

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
  
  // Check for .local subdomain
  if (hostnameWithoutPort.includes(".local")) {
    return "http://dashboard.local";
  }

  // Fallback to local development URL
  return "http://dashboard.local";
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // Если есть access_token, декодируем его и редиректим
  if (accessToken?.value) {
    const decoded = decodeJWT(accessToken.value);
    if (decoded?.userId) {
      const dashboardUrl = getDashboardUrl(request);
      return NextResponse.redirect(new URL(`${dashboardUrl}?userId=${decoded.userId}`));
    }
  }

  // Если есть refresh_token, пытаемся обновить access_token
  if (refreshToken?.value && !accessToken?.value) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      });

      if (response.ok) {
        // Refresh успешен, получаем новый access_token из Set-Cookie
        const setCookieHeaders = response.headers.getSetCookie();
        let newAccessToken: string | null = null;
        let refreshTokenValue: string | null = null;
        
        // Парсим Set-Cookie заголовки и извлекаем значения токенов
        for (const cookie of setCookieHeaders) {
          // Парсим access_token
          const accessMatch = cookie.match(/access_token=([^;]+)/);
          if (accessMatch) {
            newAccessToken = accessMatch[1];
          }
          
          // Парсим refresh_token (может быть обновлен)
          const refreshMatch = cookie.match(/refresh_token=([^;]+)/);
          if (refreshMatch) {
            refreshTokenValue = refreshMatch[1];
          }
        }
        
        if (newAccessToken) {
          const decoded = decodeJWT(newAccessToken);
          if (decoded?.userId) {
            const dashboardUrl = getDashboardUrl(request);
            const redirectResponse = NextResponse.redirect(
              new URL(`${dashboardUrl}?userId=${decoded.userId}`),
            );
            
            // Устанавливаем куки из Set-Cookie заголовков
            // Парсим каждый Set-Cookie заголовок и устанавливаем куки через Next.js API
            for (const cookieHeader of setCookieHeaders) {
              // Парсим имя куки и значение
              const nameMatch = cookieHeader.match(/^([^=]+)=([^;]+)/);
              if (nameMatch) {
                const cookieName = nameMatch[1];
                const cookieValue = nameMatch[2];
                
                // Парсим дополнительные атрибуты (Path, Domain, Max-Age, HttpOnly, Secure, SameSite)
                const pathMatch = cookieHeader.match(/Path=([^;]+)/);
                const domainMatch = cookieHeader.match(/Domain=([^;]+)/);
                const maxAgeMatch = cookieHeader.match(/Max-Age=([^;]+)/);
                const httpOnlyMatch = cookieHeader.match(/HttpOnly/);
                const secureMatch = cookieHeader.match(/Secure/);
                const sameSiteMatch = cookieHeader.match(/SameSite=([^;]+)/);
                
                // Устанавливаем куку через Next.js API
                redirectResponse.cookies.set(cookieName, cookieValue, {
                  path: pathMatch ? pathMatch[1] : "/",
                  domain: domainMatch ? domainMatch[1] : undefined,
                  maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : undefined,
                  httpOnly: !!httpOnlyMatch,
                  secure: !!secureMatch,
                  sameSite: sameSiteMatch 
                    ? (sameSiteMatch[1].toLowerCase() as "strict" | "lax" | "none")
                    : "lax",
                });
              }
            }
            
            return redirectResponse;
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        // Токен невалидный - очищаем куки и показываем форму создания
        const clearCookiesResponse = NextResponse.next();
        clearCookiesResponse.cookies.delete("access_token");
        clearCookiesResponse.cookies.delete("refresh_token");
        return clearCookiesResponse;
      }
    } catch (error) {
      // Если refresh не удался, продолжаем показывать форму создания
      console.error("Error refreshing token in middleware:", error);
    }
  }

  // Если нет токенов или они невалидные, показываем форму создания
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

