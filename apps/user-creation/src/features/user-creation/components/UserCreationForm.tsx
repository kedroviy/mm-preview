"use client";

import { Button, InputText, notificationService } from "@mm-preview/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getAppUrls } from "@/src/shared/config/constants";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import {
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../constants/validation";
import { useGoogleAuth, useLogin, useRegister } from "../hooks/useAuth";
import { getAuthErrorCode, getAuthErrorMessage } from "../utils/error";
import { getUserIdFromAccessToken, saveAccessToken } from "../utils/user";

type AuthMode = "login" | "register";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserCreationFormProps {
  mode: AuthMode;
}

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (params: Record<string, unknown>) => void;
  prompt: () => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: string | number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-google-identity="true"]',
  );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google script failed to load")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));
    document.head.appendChild(script);
  });
}

export function UserCreationForm({ mode }: UserCreationFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const {
    control,
    handleSubmit,
    resetField,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<AuthFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const isPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    googleAuthMutation.isPending;

  const redirectToDashboard = useCallback((userId: string) => {
    const dashboardUrl = getAppUrls().DASHBOARD;
    window.location.href = `${dashboardUrl}/${userId}`;
  }, []);

  const runLogin = async (email: string, password: string) => {
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
  };

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
      redirectToDashboard(userId);
    },
    [redirectToDashboard, t],
  );

  const applyAuthError = useCallback(
    (error: unknown) => {
      const message = getAuthErrorMessage(error, t);
      const code = getAuthErrorCode(error);

      if (code === "AUTH_EMAIL_ALREADY_EXISTS") {
        setError("email", {
          type: "server",
          message,
        });
      } else if (
        code === "AUTH_USER_NOT_FOUND" ||
        code === "AUTH_INVALID_CREDENTIALS"
      ) {
        setError("email", {
          type: "server",
          message,
        });
        setError("password", {
          type: "server",
          message,
        });
      } else {
        setError("root.serverError", {
          type: "server",
          message,
        });
      }

      notificationService.showError(message);
    },
    [setError, t],
  );

  const onSubmit = async (values: AuthFormData) => {
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
    }
  };

  const switchMode = () => {
    resetField("password");
    resetField("confirmPassword");
    if (mode === "login") {
      router.push("/auth/register");
      return;
    }
    router.push("/auth/login");
  };

  const handleGooglePrompt = useCallback(() => {
    if (!window.google?.accounts?.id) {
      const message = t("googleInitError");
      setError("root.serverError", { type: "server", message });
      notificationService.showError(message);
      return;
    }

    window.google.accounts.id.prompt();
  }, [setError, t]);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setIsGoogleReady(false);
      return;
    }

    const setupGoogleSignIn = async () => {
      try {
        await loadGoogleScript();

        if (!googleButtonRef.current || !window.google?.accounts?.id) {
          return;
        }

        const googleInitParams: Record<string, unknown> = {
          callback: async (response: GoogleCredentialResponse) => {
            clearErrors("root.serverError");

            if (!response.credential) {
              const message = t("errorGoogleInvalidToken");
              setError("root.serverError", { type: "server", message });
              notificationService.showError(message);
              return;
            }

            try {
              const authResponse = await googleAuthMutation.mutateAsync({
                idToken: response.credential,
              });
              runTokenLogin(authResponse.token, t("successLogin"));
            } catch (error) {
              applyAuthError(error);
            }
          },
        };
        const clientIdKey = "client_id";
        googleInitParams[clientIdKey] = googleClientId;
        window.google.accounts.id.initialize(googleInitParams);

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: "320",
        });
        setIsGoogleReady(true);
      } catch {
        const message = t("googleInitError");
        setError("root.serverError", {
          type: "server",
          message,
        });
        setIsGoogleReady(false);
      }
    };

    setupGoogleSignIn();
  }, [
    applyAuthError,
    clearErrors,
    googleAuthMutation,
    runTokenLogin,
    setError,
    t,
  ]);

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      suppressHydrationWarning
    >
      <div className="card w-full max-w-md" suppressHydrationWarning>
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              {mode === "login" ? t("titleLogin") : t("titleRegister")}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-medium">
                {t("emailLabel")}
              </label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: t("emailRequired"),
                  maxLength: {
                    value: EMAIL_MAX_LENGTH,
                    message: t("emailMaxLength"),
                  },
                  pattern: {
                    value: EMAIL_PATTERN,
                    message: t("emailInvalid"),
                  },
                }}
                render={({ field }) => (
                  <InputText
                    id="email"
                    type="email"
                    {...field}
                    value={field.value || ""}
                    className={
                      errors.email
                        ? "p-invalid !bg-red-50 dark:!bg-red-900/20"
                        : ""
                    }
                    placeholder={t("emailPlaceholder")}
                  />
                )}
              />
              {errors.email && (
                <small className="p-error text-red-600 dark:text-red-400">
                  {errors.email.message}
                </small>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-medium">
                {t("passwordLabel")}
              </label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: t("passwordRequired"),
                  minLength: {
                    value: PASSWORD_MIN_LENGTH,
                    message: t("passwordMinLength"),
                  },
                  maxLength: {
                    value: PASSWORD_MAX_LENGTH,
                    message: t("passwordMaxLength"),
                  },
                }}
                render={({ field }) => (
                  <InputText
                    id="password"
                    type="password"
                    {...field}
                    value={field.value || ""}
                    className={
                      errors.password
                        ? "p-invalid !bg-red-50 dark:!bg-red-900/20"
                        : ""
                    }
                    placeholder={t("passwordPlaceholder")}
                  />
                )}
              />
              {errors.password && (
                <small className="p-error text-red-600 dark:text-red-400">
                  {errors.password.message}
                </small>
              )}
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="font-medium">
                  {t("confirmPasswordLabel")}
                </label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: t("confirmPasswordRequired"),
                    validate: (value) =>
                      value === getValues("password") ||
                      t("passwordsDontMatch"),
                  }}
                  render={({ field }) => (
                    <InputText
                      id="confirmPassword"
                      type="password"
                      {...field}
                      value={field.value || ""}
                      className={
                        errors.confirmPassword
                          ? "p-invalid !bg-red-50 dark:!bg-red-900/20"
                          : ""
                      }
                      placeholder={t("confirmPasswordPlaceholder")}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <small className="p-error text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </small>
                )}
              </div>
            )}

            {errors.root?.serverError && (
              <small className="p-error text-red-600 dark:text-red-400">
                {errors.root.serverError.message}
              </small>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-lg px-6 py-3"
            >
              {isPending
                ? t("loading")
                : mode === "login"
                  ? t("submitLogin")
                  : t("submitRegister")}
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <small className="text-center text-muted-color">
                {t("googleClientIdMissing")}
              </small>
            )}
            <Button
              type="button"
              severity="secondary"
              outlined
              onClick={handleGooglePrompt}
              disabled={isPending || !isGoogleReady}
              className="w-full"
            >
              {t("googleButtonText")}
            </Button>
            <div ref={googleButtonRef} className="w-full flex justify-center" />
          </div>

          <Button
            type="button"
            severity="secondary"
            text
            onClick={switchMode}
            disabled={isPending}
            className="w-full"
          >
            {mode === "login" ? t("switchToRegister") : t("switchToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
