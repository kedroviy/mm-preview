import { UserCreationForm } from "@/src/features/user-creation/components/UserCreationForm";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getServerAppUrls } from "@/src/shared/config/server-constants";

async function checkAuthAndRedirect() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");

  // Если есть access_token, проверяем его валидность и получаем профиль пользователя
  if (accessToken?.value) {
    try {
      // Декодируем JWT на сервере (простая проверка без валидации подписи)
      const parts = accessToken.value.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8"),
        );
        const userId = payload.userId || payload.sub || payload.id;
        if (userId) {
          // Делаем запрос профиля пользователя, чтобы убедиться, что пользователь существует
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const userResponse = await fetch(`${apiUrl}/users/${userId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken.value}`,
                Cookie: cookieStore.toString(),
              },
              credentials: "include",
              cache: "no-store",
            });

            if (userResponse.ok) {
              const user = await userResponse.json();
              // Если пользователь существует, редиректим на dashboard
              if (user?.userId) {
                const urls = getServerAppUrls(request);
                redirect(`${urls.DASHBOARD}?userId=${user.userId}`);
              }
            }
          } catch (userError: any) {
            // Если это ошибка редиректа Next.js, пробрасываем её дальше
            if (userError?.digest?.startsWith("NEXT_REDIRECT")) {
              throw userError;
            }
            // Если запрос профиля не удался, продолжаем показывать форму
            console.error("Error fetching user profile:", userError);
          }
        }
      }
    } catch (error: any) {
      // Если это ошибка редиректа Next.js, пробрасываем её дальше
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      // Если декодирование не удалось, продолжаем
      console.error("Error decoding token:", error);
    }
  }

  // Если есть refresh_token, пытаемся обновить
  if (refreshToken?.value && !accessToken?.value) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) {
        // Получаем Set-Cookie из ответа
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
          // Декодируем новый токен
          const parts = newAccessToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(
              Buffer.from(parts[1], "base64").toString("utf-8"),
            );
            const userId = payload.userId || payload.sub || payload.id;
            if (userId) {
              // Делаем запрос профиля пользователя, чтобы убедиться, что пользователь существует
              try {
                const userResponse = await fetch(`${apiUrl}/users/${userId}`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newAccessToken}`,
                    Cookie: cookieStore.toString(),
                  },
                  credentials: "include",
                  cache: "no-store",
                });

                if (userResponse.ok) {
                  const user = await userResponse.json();
                  // Если пользователь существует, редиректим на dashboard
                  if (user?.userId) {
                    const urls = getServerAppUrls(request);
                    redirect(`${urls.DASHBOARD}?userId=${user.userId}`);
                  }
                }
              } catch (userError: any) {
                // Если это ошибка редиректа Next.js, пробрасываем её дальше
                if (userError?.digest?.startsWith("NEXT_REDIRECT")) {
                  throw userError;
                }
                // Если запрос профиля не удался, продолжаем показывать форму
                console.error("Error fetching user profile:", userError);
              }
            }
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        // Токен невалидный - очищаем куки и продолжаем показывать форму
        // (редирект не нужен, так как мы уже на странице создания пользователя)
        console.error("Invalid refresh token, clearing cookies");
      }
    } catch (error: any) {
      // Если это ошибка редиректа Next.js, пробрасываем её дальше
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      // Если refresh не удался, продолжаем показывать форму
      console.error("Error refreshing token on server:", error);
    }
  }
}

export default async function UserCreationPage() {
  // Проверяем токены на сервере перед рендерингом
  await checkAuthAndRedirect();
  
  // Если дошли сюда, значит токенов нет или они невалидные - показываем форму
  return <UserCreationForm />;
}
