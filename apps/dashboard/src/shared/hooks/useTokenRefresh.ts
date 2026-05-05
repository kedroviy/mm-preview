"use client";

import { getAccessToken } from "@mm-preview/sdk";
import { useCallback, useEffect } from "react";

export function useTokenRefresh() {
  const checkAndRefreshToken = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (token) return;
      const userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
      if (userCreationUrl && typeof window !== "undefined") {
        window.location.href = userCreationUrl;
      }
    } catch (error: any) {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkAndRefreshToken();
  }, [checkAndRefreshToken]);

  return {
    refreshToken: checkAndRefreshToken,
  };
}
