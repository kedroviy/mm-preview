"use client";

import { notificationService } from "@mm-preview/ui";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { getAppUrls } from "@/src/shared/config/constants";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import type { AuthFormData, AuthFormModeStatus, AuthMode } from "../types/auth";
import { getAuthErrorCode, getAuthErrorMessage } from "../utils/error";
import {
  AUTH_FORM_MODE,
  defaultAuthFormMode,
  selectAuthUiState,
} from "../utils/auth-form-mode";
import { getUserIdFromAccessToken, saveAccessToken } from "../utils/user";
import { useGoogleAuth, useLogin, useRegister } from "./useAuth";

const defaultValues: AuthFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  mode: defaultAuthFormMode,
};

export function useAuthForm(authMode: AuthMode) {
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

  const { setError, clearErrors, resetField, setValue, getValues, watch } = form;

  const formMode = watch("mode");

  const isMutationPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    googleAuthMutation.isPending;

  const { isDoneAuthorize, isLoading, isInteractionBlocked } = useMemo(
    () => selectAuthUiState(formMode, isMutationPending),
    [formMode, isMutationPending],
  );

  const setFormMode = useCallback(
    (status: AuthFormModeStatus) => {
      setValue("mode", { status });
    },
    [setValue],
  );

  const isAuthBusy = useCallback(() => {
    const { mode } = getValues();
    return selectAuthUiState(mode, isMutationPending).isInteractionBlocked;
  }, [getValues, isMutationPending]);

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

  const markAuthorizeDone = useCallback(() => {
    setFormMode(AUTH_FORM_MODE.DONE_AUTHORIZE);
  }, [setFormMode]);

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

      markAuthorizeDone();
      notificationService.showSuccess(t("successLogin"));
      redirectToDashboard(userId);
    },
    [loginMutation, markAuthorizeDone, redirectToDashboard, t],
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

      markAuthorizeDone();
      notificationService.showSuccess(successMessage);
      redirectToDashboardRoot();
    },
    [markAuthorizeDone, redirectToDashboardRoot, t],
  );

  const onSubmit = useCallback(
    async (values: AuthFormData) => {
      if (isAuthBusy()) {
        return;
      }

      setFormMode(AUTH_FORM_MODE.SUBMITTING);
      clearErrors("root.serverError");

      try {
        if (authMode === "register") {
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
        if (getValues("mode").status !== AUTH_FORM_MODE.DONE_AUTHORIZE) {
          setFormMode(AUTH_FORM_MODE.IDLE);
        }
      }
    },
    [
      applyAuthError,
      authMode,
      clearErrors,
      getValues,
      isAuthBusy,
      registerMutation,
      runLogin,
      setFormMode,
      t,
    ],
  );

  const switchMode = useCallback(() => {
    if (isInteractionBlocked) {
      return;
    }

    resetField("password");
    resetField("confirmPassword");

    if (authMode === "login") {
      router.push("/auth/register");
      return;
    }

    router.push("/auth/login");
  }, [authMode, isInteractionBlocked, resetField, router]);

  const googleAuth = useMemo(
    () => ({
      mutateAsync: googleAuthMutation.mutateAsync,
    }),
    [googleAuthMutation.mutateAsync],
  );

  return {
    form,
    authMode,
    formMode,
    isMutationPending,
    isLoading,
    isDoneAuthorize,
    isAuthBusy,
    setFormMode,
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
