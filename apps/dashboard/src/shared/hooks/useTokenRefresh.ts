"use client";

import {
  authApi,
  getAccessToken,
  getRefreshToken,
  getUserIdFromToken,
  removeAllAuthTokens,
  setAccessToken,
} from "@mm-preview/sdk";
import { useCallback, useEffect } from "react";

/**
 * Хук для проверки и обновления токена на клиенте
 * Используется на страницах где нужно убедиться что токен актуален
 */
export function useTokenRefresh() {
  const checkAndRefreshToken = useCallback(async () => {
    try {
      // Проверяем access_token
      const accessToken = getAccessToken();

      // Если access_token есть, проверяем его валидность (простая проверка структуры)
      if (accessToken) {
        const userId = getUserIdFromToken(accessToken);
        if (userId) {
          // Токен выглядит валидным
          return;
        }
      }

      // Если access_token нет или невалидный, проверяем refresh_token
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // Нет refresh_token, возможно он HTTP-only
        // Пытаемся обновить токен через API (браузер отправит HTTP-only cookie автоматически)
        try {
          const response = await authApi.refreshToken();
          if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
            console.log("✅ Token refreshed via API");
          }
        } catch (error: any) {
          console.error("❌ Failed to refresh token:", error);
          // Если токен невалидный (401/403), очищаем куки и редиректим на страницу входа
          if (error?.status === 401 || error?.status === 403) {
            removeAllAuthTokens();
            const userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
            if (!userCreationUrl) {
              console.error("❌ NEXT_PUBLIC_USER_CREATION_URL is not set");
              return;
            }
            window.location.href = userCreationUrl;
          } else {
            removeAllAuthTokens();
          }
        }
        return;
      }

      // Если refresh_token есть, пытаемся обновить
      try {
        const response = await authApi.refreshToken();
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
          console.log("✅ Token refreshed via API");
        }
      } catch (error: any) {
        console.error("❌ Failed to refresh token:", error);
        // Если токен невалидный (401/403), очищаем куки и редиректим на страницу входа
        if (error?.status === 401 || error?.status === 403) {
          removeAllAuthTokens();
          const userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
          if (!userCreationUrl) {
            console.error("❌ NEXT_PUBLIC_USER_CREATION_URL is not set");
            return;
          }
          window.location.href = userCreationUrl;
        } else {
          removeAllAuthTokens();
        }
      }
    } catch (error) {
      console.error("Error in token refresh check:", error);
    }
  }, []);

  useEffect(() => {
    // Проверяем токен при монтировании компонента
    checkAndRefreshToken();
  }, [checkAndRefreshToken]);

  return {
    refreshToken: checkAndRefreshToken,
  };
}
