import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getUserCreationUrl(request: NextRequest): string {
  const envValue = process.env.NEXT_PUBLIC_USER_CREATION_URL;

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
  
  // Check for .local subdomain
  if (hostnameWithoutPort.includes(".local")) {
    return "http://user-creation.local";
  }

  // Fallback to local development URL
  return "http://user-creation.local";
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // Если есть access_token, пропускаем
  if (accessToken) {
    return NextResponse.next();
  }

  // Если есть refresh_token, пытаемся обновить access_token на сервере
  if (refreshToken) {
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
        const responseWithCookies = NextResponse.next();
        
        // Копируем Set-Cookie заголовки из ответа refresh
        setCookieHeaders.forEach((cookie) => {
          responseWithCookies.headers.append("Set-Cookie", cookie);
        });
        
        return responseWithCookies;
      }
    } catch (error) {
      // Если refresh не удался, продолжаем - клиент попробует обновить
      console.error("Error refreshing token in middleware:", error);
    }
    
    // Пропускаем запрос даже если refresh не удался - клиент попробует обновить
    return NextResponse.next();
  }

  // Если нет ни access, ни refresh токена, редиректим на страницу создания пользователя
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
