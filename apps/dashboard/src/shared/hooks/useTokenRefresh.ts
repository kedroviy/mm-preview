"use client";

import { authApi } from "@mm-preview/sdk";
import { useCallback, useEffect } from "react";

export function useTokenRefresh() {
  const checkAndRefreshToken = useCallback(async () => {
    try {
      // 1. Мы БОЛЬШЕ НЕ ПРОВЕРЯЕМ getAccessToken() через JS.
      // 2. Просто делаем проверочный вызов или рефреш. 
      // Браузер сам прикрепит HttpOnly куки благодаря credentials: 'include'.

      const response = await authApi.refreshToken();

      // 3. Если бэкенд ответил OK, значит куки обновились через Set-Cookie автоматически.
      // Нам НЕ НУЖНО вызывать setAccessToken() здесь.
      if (response.data?.accessToken) {
        console.log("✅ Token session is active (managed by browser)");
      }
    } catch (error: any) {
      // 4. Если получаем 401/403 — сессия реально мертва.
      if (error?.status === 401 || error?.status === 403) {
        console.error("❌ Session expired, redirecting...");

        const userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
        if (userCreationUrl && typeof window !== "undefined") {
          window.location.href = userCreationUrl;
        }
      }
    }
  }, []);

  useEffect(() => {
    checkAndRefreshToken();
  }, [checkAndRefreshToken]);

  return {
    refreshToken: checkAndRefreshToken,
  };
}
