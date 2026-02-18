import { UserCreationForm } from "@/src/features/user-creation/components/UserCreationForm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerAppUrls } from "@/src/shared/config/server-constants";

async function checkAuthAndRedirect() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");

  // Если есть access_token, пытаемся получить userId и редиректить
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
          const urls = getServerAppUrls();
          redirect(`${urls.DASHBOARD}?userId=${userId}`);
        }
      }
    } catch (error) {
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
              const urls = getServerAppUrls();
              redirect(`${urls.DASHBOARD}?userId=${userId}`);
            }
          }
        }
      }
    } catch (error) {
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
