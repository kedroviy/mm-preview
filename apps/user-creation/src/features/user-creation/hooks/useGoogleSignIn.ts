"use client";

import { notificationService } from "@mm-preview/ui";
import { useCallback, useEffect, useRef } from "react";
import type { TranslationKey } from "@/src/shared/i18n/locales";
import type { GoogleCredentialResponse } from "../types/auth";
import { loadGoogleScript } from "../utils/google-script";
import type { UseAuthFormReturn } from "./useAuthForm";

let googleSignInInitialized = false;

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

  const handlersRef = useRef({
    applyAuthError,
    clearRootError,
    googleAuth,
    isLoadingRef,
    runTokenLogin,
    setRootError,
    translate,
  });
  handlersRef.current = {
    applyAuthError,
    clearRootError,
    googleAuth,
    isLoadingRef,
    runTokenLogin,
    setRootError,
    translate,
  };

  useEffect(() => {
    if (!googleClientId || googleSignInInitialized) {
      return;
    }

    let cancelled = false;

    const setupGoogleSignIn = async () => {
      try {
        await loadGoogleScript();

        if (cancelled || !window.google?.accounts?.id) {
          return;
        }

        googleSignInInitialized = true;

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: GoogleCredentialResponse) => {
            const handlers = handlersRef.current;

            if (handlers.isLoadingRef.current) {
              return;
            }

            handlers.clearRootError();

            if (!response.credential) {
              const message = handlers.translate("errorGoogleInvalidToken");
              handlers.setRootError(message);
              notificationService.showError(message);
              return;
            }

            try {
              const authResponse = await handlers.googleAuth.mutateAsync({
                idToken: response.credential,
              });
              handlers.runTokenLogin(
                authResponse.token,
                handlers.translate("successLogin"),
              );
            } catch (error) {
              handlers.applyAuthError(error);
            }
          },
        });
      } catch {
        if (!cancelled) {
          setRootError(translate("googleInitError"));
        }
      }
    };

    setupGoogleSignIn();

    return () => {
      cancelled = true;
    };
  }, [googleClientId, setRootError, translate]);

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
