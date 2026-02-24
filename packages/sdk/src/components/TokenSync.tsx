"use client";

import { useEffect } from "react";
import {
  getTokensFromStorage,
  syncTokensFromStorageToCookies,
} from "../utils/token-sync";

/**
 * Компонент для синхронизации токенов из localStorage в cookies
 * Используется в dev режиме для передачи токенов между разными портами
 * Должен быть добавлен в layout.tsx каждого приложения
 */
export function TokenSync() {
  useEffect(() => {
    // Проверяем, находимся ли мы в dev режиме
    const isDev =
      process.env.NODE_ENV === "development" ||
      (!process.env.NODE_ENV && !process.env.VERCEL);

    if (!isDev) {
      return;
    }

    // Синхронизируем токены из localStorage в cookies при загрузке страницы
    const syncTokens = () => {
      const tokens = getTokensFromStorage();
      if (tokens.accessToken || tokens.refreshToken) {
        syncTokensFromStorageToCookies();
      }
    };

    // Синхронизируем сразу
    syncTokens();

    // Также синхронизируем периодически (на случай, если токены были установлены после загрузки)
    const interval = setInterval(syncTokens, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}
