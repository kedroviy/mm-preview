"use client";

import { notificationService } from "@mm-preview/ui";
import { useCallback, useEffect } from "react";
import type { TranslationKey } from "@/src/shared/i18n/locales";
import type { GoogleCredentialResponse } from "../types/auth";
import { loadGoogleScript } from "../utils/google-script";
import type { UseAuthFormReturn } from "./useAuthForm";

type UseGoogleSignInParams = Pick<
  UseAuthFormReturn,
  | "applyAuthError"
  | "clearRootError"
  | "googleAuth"
  | "isLoadingRef"
  | "runTokenLogin"
  | "setRootError"
> & {
  translate: (key: TranslationKey) => string;
};

export function useGoogleSignIn({
  applyAuthError,
  clearRootError,
  googleAuth,
  isLoadingRef,
  runTokenLogin,
  setRootError,
  translate,
}: UseGoogleSignInParams) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isClientIdMissing = !googleClientId;

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const setupGoogleSignIn = async () => {
      try {
        await loadGoogleScript();

        if (!window.google?.accounts?.id) {
          return;
        }

        const googleInitParams: Record<string, unknown> = {
          callback: async (response: GoogleCredentialResponse) => {
            if (isLoadingRef.current) {
              return;
            }

            clearRootError();

            if (!response.credential) {
              const message = translate("errorGoogleInvalidToken");
              setRootError(message);
              notificationService.showError(message);
              return;
            }

            try {
              const authResponse = await googleAuth.mutateAsync({
                idToken: response.credential,
              });
              runTokenLogin(authResponse.token, translate("successLogin"));
            } catch (error) {
              applyAuthError(error);
            }
          },
        };

        const clientIdKey = "client_id";
        googleInitParams[clientIdKey] = googleClientId;
        window.google.accounts.id.initialize(googleInitParams);
      } catch {
        setRootError(translate("googleInitError"));
      }
    };

    setupGoogleSignIn();
  }, [
    applyAuthError,
    clearRootError,
    googleAuth,
    googleClientId,
    isLoadingRef,
    runTokenLogin,
    setRootError,
    translate,
  ]);

  const signInWithGoogle = useCallback(() => {
    if (!googleClientId || isLoadingRef.current) {
      return;
    }

    if (!window.google?.accounts?.id) {
      const message = translate("googleInitError");
      setRootError(message);
      notificationService.showError(message);
      return;
    }

    clearRootError();
    window.google.accounts.id.prompt();
  }, [clearRootError, googleClientId, isLoadingRef, setRootError, translate]);

  return {
    signInWithGoogle,
    isClientIdMissing,
  };
}
