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
        
        for (const cookie of setCookieHeaders) {
          const match = cookie.match(/access_token=([^;]+)/);
          if (match) {
            newAccessToken = match[1];
            break;
          }
        }
        
        if (newAccessToken) {
          const decoded = decodeJWT(newAccessToken);
          if (decoded?.userId) {
            const dashboardUrl = getDashboardUrl(request);
            const redirectResponse = NextResponse.redirect(
              new URL(`${dashboardUrl}?userId=${decoded.userId}`),
            );
            
            // Копируем Set-Cookie заголовки из ответа refresh
            setCookieHeaders.forEach((cookie) => {
              redirectResponse.headers.append("Set-Cookie", cookie);
            });
            
            return redirectResponse;
          }
        }
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

