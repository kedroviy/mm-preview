"use client";

import { notificationService } from "@mm-preview/ui";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { getAppUrls } from "@/src/shared/config/constants";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import type { AuthFormData, AuthMode } from "../types/auth";
import { getAuthErrorCode, getAuthErrorMessage } from "../utils/error";
import { getUserIdFromAccessToken, saveAccessToken } from "../utils/user";
import { useGoogleAuth, useLogin, useRegister } from "./useAuth";

const defaultValues: AuthFormData = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function useAuthForm(mode: AuthMode) {
  const router = useRouter();
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();

  const form = useForm<AuthFormData>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { setError, clearErrors, resetField } = form;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading =
    isSubmitting ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    googleAuthMutation.isPending;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const redirectToDashboard = useCallback((userId: string) => {
    const dashboardUrl = getAppUrls().DASHBOARD;
    window.location.href = `${dashboardUrl}/${userId}`;
  }, []);

  const redirectToDashboardRoot = useCallback(() => {
    const dashboardUrl = getAppUrls().DASHBOARD;
    window.location.href = dashboardUrl;
  }, []);

  const applyAuthError = useCallback(
    (error: unknown) => {
      const message = getAuthErrorMessage(error, t);
      const code = getAuthErrorCode(error);

      if (code === "AUTH_EMAIL_ALREADY_EXISTS") {
        setError("email", { type: "server", message });
      } else if (
        code === "AUTH_USER_NOT_FOUND" ||
        code === "AUTH_INVALID_CREDENTIALS"
      ) {
        setError("email", { type: "server", message });
        setError("password", { type: "server", message });
      } else {
        setError("root.serverError", { type: "server", message });
      }

      notificationService.showError(message);
    },
    [setError, t],
  );

  const runLogin = useCallback(
    async (email: string, password: string) => {
      const response = await loginMutation.mutateAsync({ email, password });

      if (!response.token) {
        throw new Error(t("genericError"));
      }

      saveAccessToken(response.token);
      const userId = getUserIdFromAccessToken(response.token);

      if (!userId) {
        throw new Error(t("genericError"));
      }

      notificationService.showSuccess(t("successLogin"));
      redirectToDashboard(userId);
    },
    [loginMutation, redirectToDashboard, t],
  );

  const runTokenLogin = useCallback(
    (token: string, successMessage: string) => {
      if (!token) {
        throw new Error(t("genericError"));
      }

      saveAccessToken(token);
      const userId = getUserIdFromAccessToken(token);

      if (!userId) {
        throw new Error(t("genericError"));
      }

      notificationService.showSuccess(successMessage);
      redirectToDashboardRoot();
    },
    [redirectToDashboardRoot, t],
  );

  const onSubmit = useCallback(
    async (values: AuthFormData) => {
      if (isLoadingRef.current) {
        return;
      }

      setIsSubmitting(true);
      clearErrors("root.serverError");

      try {
        if (mode === "register") {
          await registerMutation.mutateAsync({
            email: values.email,
            password: values.password,
          });
          notificationService.showSuccess(t("successRegister"));
        }

        await runLogin(values.email, values.password);
      } catch (error) {
        applyAuthError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [applyAuthError, clearErrors, mode, registerMutation, runLogin, t],
  );

  const switchMode = useCallback(() => {
    if (isLoading) {
      return;
    }

    resetField("password");
    resetField("confirmPassword");

    if (mode === "login") {
      router.push("/auth/register");
      return;
    }

    router.push("/auth/login");
  }, [isLoading, mode, resetField, router]);

  const googleAuth = useMemo(
    () => ({
      mutateAsync: googleAuthMutation.mutateAsync,
    }),
    [googleAuthMutation.mutateAsync],
  );

  return {
    form,
    mode,
    isLoading,
    isLoadingRef,
    onSubmit,
    switchMode,
    applyAuthError,
    runTokenLogin,
    googleAuth,
    clearRootError: () => clearErrors("root.serverError"),
    setRootError: (message: string) =>
      setError("root.serverError", { type: "server", message }),
  };
}

export type UseAuthFormReturn = ReturnType<typeof useAuthForm>;
