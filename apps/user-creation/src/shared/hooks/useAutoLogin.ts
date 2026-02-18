"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAccessToken,
  getRefreshToken,
  getUserIdFromToken,
  useUser,
  authApi,
  removeAllAuthTokens,
} from "@mm-preview/sdk";
import { getAppUrls } from "@/src/shared/config/constants";

export function useAutoLogin() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false); // Начинаем с false, т.к. проверка на сервере
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Проверка на клиенте только как fallback для случаев когда middleware не сработал
    // Основная проверка происходит в middleware и Server Component
    const checkAndRefreshToken = async () => {
      try {
        console.log("🔍 Starting token check...");
        
        // Проверяем все cookies для отладки
        if (typeof document !== "undefined") {
          console.log("All cookies:", document.cookie);
          const allCookies = document.cookie.split(";").map(c => c.trim());
          console.log("Parsed cookies:", allCookies);
          const refreshCookie = allCookies.find(c => c.startsWith("refresh_token="));
          const accessCookie = allCookies.find(c => c.startsWith("access_token="));
          console.log("Refresh token cookie found:", !!refreshCookie);
          console.log("Access token cookie found:", !!accessCookie);
        }
        
        // Сначала проверяем access_token
        let accessToken = getAccessToken();
        console.log("Access token exists (via getAccessToken):", !!accessToken);
        
        // Если access_token есть и валидный, используем его
        if (accessToken) {
          const decodedUserId = getUserIdFromToken(accessToken);
          console.log("Decoded userId from access token:", decodedUserId);
          if (decodedUserId) {
            console.log("✅ Valid access token found, using it");
            setUserId(decodedUserId);
            setShouldRedirect(true);
            setIsChecking(false);
            return;
          } else {
            console.log("⚠️ Access token exists but invalid, will try refresh");
          }
        }

        // Если access_token нет или невалидный, проверяем refresh_token
        const refreshToken = getRefreshToken();
        console.log("Refresh token exists (via getRefreshToken):", !!refreshToken);
        
        // Также пробуем получить напрямую из document.cookie
        let refreshTokenDirect: string | null = null;
        if (typeof document !== "undefined") {
          const cookies = document.cookie.split(";");
          const refreshCookie = cookies.find(c => c.trim().startsWith("refresh_token="));
          if (refreshCookie) {
            refreshTokenDirect = refreshCookie.split("=")[1]?.trim() || null;
            console.log("Refresh token found directly in document.cookie:", !!refreshTokenDirect);
          }
        }
        
        // Используем refreshToken из getRefreshToken или напрямую из cookies
        const finalRefreshToken = refreshToken || refreshTokenDirect;
        console.log("Final refresh token to use:", !!finalRefreshToken);
        
        // Если refresh_token не виден в document.cookie, это может быть HTTP-only cookie
        // или cookie установлена для другого домена/порта
        // В этом случае она все равно отправится автоматически в запросе с credentials: "include"
        // Поэтому пробуем сделать refresh даже если не видим токен в document.cookie
        
        if (!finalRefreshToken) {
          console.log("⚠️ Refresh token not visible in document.cookie");
          console.log("This might be HTTP-only cookie or cookie for different domain/port");
          console.log("Will try to refresh anyway - cookie will be sent automatically if it exists");
        }

        // Пытаемся обновить access_token используя refresh_token
        // Если cookie HTTP-only или для другого домена, она отправится автоматически
        try {
          console.log("🔄 Attempting to refresh access token...");
          console.log("Refresh token visible in JS:", !!finalRefreshToken);
          console.log("Note: HTTP-only cookies are sent automatically even if not visible in JS");
          
          // Вызываем refresh без передачи токена в теле - он должен быть в cookies
          // Если cookie HTTP-only, она отправится автоматически благодаря credentials: "include"
          const response = await authApi.refreshToken();
          console.log("Refresh response status:", response.status);
          console.log("Refresh response data:", response.data);
          
          // Проверяем Set-Cookie заголовки в ответе (если доступны)
          // В браузере мы не можем напрямую получить Set-Cookie, но можем проверить cookies после запроса
          
          // После успешного refresh, новый access_token должен быть в cookies через Set-Cookie
          // Даем небольшую задержку чтобы браузер успел установить cookie
          await new Promise((resolve) => setTimeout(resolve, 200));
          
          // Проверяем токен снова
          accessToken = getAccessToken();
          console.log("Access token after refresh:", !!accessToken);
          
          // Также проверяем все cookies для отладки
          if (typeof document !== "undefined") {
            console.log("All cookies:", document.cookie);
          }
          
          if (accessToken) {
            const decodedUserId = getUserIdFromToken(accessToken);
            console.log("Decoded userId after refresh:", decodedUserId);
            if (decodedUserId) {
              console.log("✅ Token refreshed successfully, userId:", decodedUserId);
              setUserId(decodedUserId);
              setShouldRedirect(true);
              setIsChecking(false);
              return;
            }
          }
          
          // Если после refresh не получили userId, что-то не так
          console.warn("⚠️ Token refreshed but userId not found or token not in cookies");
          console.warn("Response data:", response.data);
          console.warn("Trying to get userId from response data...");
          
          // Возможно userId есть в ответе
          if (response.data && typeof response.data === "object") {
            const responseUserId = response.data.userId || response.data.user?.userId;
            if (responseUserId) {
              console.log("Found userId in response:", responseUserId);
              setUserId(responseUserId);
              setShouldRedirect(true);
              setIsChecking(false);
              return;
            }
          }
          
          removeAllAuthTokens();
          setIsChecking(false);
        } catch (refreshError: any) {
          // Refresh token протух или невалидный - удаляем все токены
          console.error("❌ Failed to refresh token:", refreshError);
          console.error("Error details:", {
            message: refreshError?.message,
            status: refreshError?.status,
            code: refreshError?.code,
          });
          removeAllAuthTokens();
          setIsChecking(false);
          // Если токен невалидный (401/403), пользователь уже на странице входа (user-creation)
          // Просто очищаем токены, редирект не нужен
        }
      } catch (error) {
        console.error("❌ Error checking token:", error);
        removeAllAuthTokens();
        setIsChecking(false);
      }
    };

    checkAndRefreshToken();
  }, []);

  // Проверяем пользователя если userId найден
  const { data: user, isLoading: isUserLoading } = useUser(userId || "", {
    enabled: !!userId && shouldRedirect,
  });

  // Редиректим на dashboard когда пользователь загружен
  useEffect(() => {
    if (user && shouldRedirect && !isUserLoading) {
      const urls = getAppUrls();
      router.push(`${urls.DASHBOARD}/${user.userId}`);
    }
  }, [user, shouldRedirect, isUserLoading, router]);

  return {
    isChecking: isChecking || isUserLoading,
    shouldRedirect,
    user,
  };
}

