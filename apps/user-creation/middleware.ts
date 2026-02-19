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

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Формируем строку кук только из нужных токенов
  function buildCookieString(token?: { name: string; value: string }): string {
    const cookies: string[] = [];
    if (token) {
      cookies.push(`${token.name}=${token.value}`);
    }
    if (refreshToken?.value) {
      cookies.push(`refresh_token=${refreshToken.value}`);
    }
    return cookies.join("; ");
  }

  // Функция для получения профиля и редиректа
  async function fetchProfileAndRedirect(token?: { name: string; value: string }): Promise<NextResponse | null> {
    try {
      const cookieString = buildCookieString(token);
      const tokenValue = token?.value;
      
      console.log("[user-creation middleware] Fetching profile:");
      console.log("  - Cookie string:", cookieString || "missing");
      console.log("  - Token value:", tokenValue ? `${tokenValue.substring(0, 20)}...` : "missing");
      console.log("  - API URL:", apiUrl);
      
      // Бэкенд может требовать токен и в заголовке Authorization, и в куках
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Добавляем Cookie заголовок
      if (cookieString) {
        headers.Cookie = cookieString;
      }
      
      // Добавляем Authorization заголовок, если есть токен
      if (tokenValue) {
        headers.Authorization = `Bearer ${tokenValue}`;
        console.log("  - Authorization header: Bearer <token>");
      }
      
      console.log("  - Final headers:", JSON.stringify(Object.keys(headers)));
      
      const userResponse = await fetch(`${apiUrl}/users/profile`, {
        method: "GET",
        headers: {
          ...headers,
          Origin: request.headers.get("origin") || request.url.split("/").slice(0, 3).join("/"),
        },
        credentials: "include",
        cache: "no-store",
      });

      console.log("[user-creation middleware] Profile response status:", userResponse.status);

      if (userResponse.ok) {
        const user = await userResponse.json();
        if (user?.userId) {
          console.log("[user-creation middleware] Profile fetched, redirecting to dashboard with userId:", user.userId);
          const dashboardUrl = getDashboardUrl(request);
          
          // Передаем токены через URL параметры для кросс-доменной/кросс-портовой передачи
          // Это работает когда куки не могут быть переданы напрямую между разными портами/доменами
          const redirectUrl = new URL(`${dashboardUrl}/${user.userId}`);
          
          if (accessToken?.value) {
            redirectUrl.searchParams.set("access_token", accessToken.value);
          }
          if (refreshToken?.value) {
            redirectUrl.searchParams.set("refresh_token", refreshToken.value);
          }
          
          const redirectResponse = NextResponse.redirect(redirectUrl);
          
          // НЕ удаляем куки на user-creation - они должны остаться для этого домена/порта
          // Токены передаются через URL параметры для dashboard, но куки остаются на user-creation
          // Это позволяет пользователю вернуться на user-creation и иметь валидные куки
          
          console.log("[user-creation middleware] Redirecting with tokens in URL (cookies preserved on user-creation):", {
            requestHost: request.headers.get("host") || "",
            hasAccessToken: !!accessToken?.value,
            hasRefreshToken: !!refreshToken?.value,
          });
          
          // НЕ устанавливаем куки в redirectResponse, так как они уже есть и должны остаться
          // Токены передаются через URL для dashboard
          
          return redirectResponse;
        }
      } else {
        const errorText = await userResponse.text().catch(() => "");
        console.error("[user-creation middleware] Profile fetch failed:", userResponse.status, errorText);
      }
    } catch (error) {
      console.error("[user-creation middleware] Error fetching profile:", error);
    }
    return null;
  }

  // Если есть access_token, проверяем его валидность через запрос к профилю
  if (accessToken?.value) {
    const redirectResponse = await fetchProfileAndRedirect(accessToken);
    if (redirectResponse) {
      return redirectResponse;
    }
    // Если запрос не удался (401/403), продолжаем к refresh_token логике
  }

  // Если есть refresh_token, пытаемся обновить access_token
  if (refreshToken?.value) {
    try {
      // Для refresh используем только refresh_token
      const refreshCookieString = refreshToken?.value 
        ? `refresh_token=${refreshToken.value}` 
        : "";
      
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: refreshCookieString,
          Origin: request.headers.get("origin") || request.url.split("/").slice(0, 3).join("/"),
        },
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) {
        // Refresh успешен, получаем новый access_token из Set-Cookie
        const setCookieHeaders = response.headers.getSetCookie();
        let newAccessToken: string | null = null;
        
        // Парсим Set-Cookie заголовки и извлекаем access_token
        for (const cookie of setCookieHeaders) {
          const accessMatch = cookie.match(/access_token=([^;]+)/);
          if (accessMatch) {
            newAccessToken = accessMatch[1];
            break;
          }
        }
        
        if (newAccessToken) {
          // Формируем строку кук с новым access_token из refresh ответа
          const updatedCookieString = buildCookieString({ name: "access_token", value: newAccessToken });
          
          // Делаем запрос к профилю с новым токеном (передаем и в Authorization, и в Cookie)
          const userResponse = await fetch(`${apiUrl}/users/profile`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccessToken}`,
              Cookie: updatedCookieString,
              Origin: request.headers.get("origin") || request.url.split("/").slice(0, 3).join("/"),
            },
            credentials: "include",
            cache: "no-store",
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            if (user?.userId) {
              const dashboardUrl = getDashboardUrl(request);
              
              // Передаем токены через URL параметры для кросс-доменной/кросс-портовой передачи
              const redirectUrl = new URL(`${dashboardUrl}/${user.userId}`);
              
              // Извлекаем токены из Set-Cookie заголовков
              let extractedAccessToken: string | null = null;
              let extractedRefreshToken: string | null = null;
              
              for (const cookieHeader of setCookieHeaders) {
                const accessMatch = cookieHeader.match(/access_token=([^;]+)/);
                if (accessMatch) {
                  extractedAccessToken = accessMatch[1];
                }
                const refreshMatch = cookieHeader.match(/refresh_token=([^;]+)/);
                if (refreshMatch) {
                  extractedRefreshToken = refreshMatch[1];
                }
              }
              
              // Если токены не найдены в Set-Cookie, используем существующие из запроса
              if (!extractedAccessToken && accessToken?.value) {
                extractedAccessToken = accessToken.value;
              }
              if (!extractedRefreshToken && refreshToken?.value) {
                extractedRefreshToken = refreshToken.value;
              }
              
              if (extractedAccessToken) {
                redirectUrl.searchParams.set("access_token", extractedAccessToken);
              }
              if (extractedRefreshToken) {
                redirectUrl.searchParams.set("refresh_token", extractedRefreshToken);
              }
              
              const redirectResponse = NextResponse.redirect(redirectUrl);
              
              // НЕ устанавливаем куки в redirectResponse для user-creation
              // Куки должны остаться на user-creation, токены передаются через URL для dashboard
              // Если нужно обновить куки на user-creation, это можно сделать отдельно
              
              console.log("[user-creation middleware] Redirecting after refresh with tokens in URL (cookies preserved)");
              
              return redirectResponse;
            }
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        // Токен невалидный - очищаем куки и показываем форму создания
        const clearCookiesResponse = NextResponse.next();
        const requestHost = request.headers.get("host") || "";
        const { getCookieDomain } = await import("@mm-preview/sdk");
        const cookieDomain = getCookieDomain(requestHost);
        
        // Удаляем куки с правильным доменом
        clearCookiesResponse.cookies.set("access_token", "", {
          expires: new Date(0),
          domain: cookieDomain,
          path: "/",
        });
        clearCookiesResponse.cookies.set("refresh_token", "", {
          expires: new Date(0),
          domain: cookieDomain,
          path: "/",
        });
        return clearCookiesResponse;
      }
    } catch (error) {
      // Если refresh не удался, продолжаем показывать форму создания
      console.error("[user-creation middleware] Error refreshing token:", error);
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

