"use client";

import { authApi, getAccessToken, getUserIdFromToken } from "@mm-preview/sdk";
import { Button, InputText, notificationService } from "@mm-preview/ui";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getAppUrls } from "@/src/shared/config/constants";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import { getErrorMessage } from "../utils/error";

interface UserFormData {
  email: string;
  password: string;
}

export function UserCreationForm() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isPending, setIsPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const redirectToDashboard = () => {
    const token = getAccessToken();
    const userId = getUserIdFromToken(token);
    if (!userId) return;
    const dashboardUrl = getAppUrls().DASHBOARD;
    window.location.href = `${dashboardUrl}/${userId}/rooms`;
  };

  const onSubmit = async (data: UserFormData) => {
    setIsPending(true);
    try {
      if (mode === "register") {
        await authApi.register({ email: data.email, password: data.password });
      }

      const loginRes = await authApi.login({
        email: data.email,
        password: data.password,
      });

      if (!loginRes.data?.token) {
        throw new Error("No token in response");
      }

      notificationService.showSuccess(
        mode === "register" ? "Registered" : "Logged in",
      );

      redirectToDashboard();
    } catch (error) {
      notificationService.showError(getErrorMessage(error, t("error")));
      reset(undefined, {
        keepValues: true,
        keepErrors: false,
        keepDirty: true,
        keepIsSubmitted: false,
        keepTouched: true,
        keepIsValid: false,
        keepSubmitCount: false,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      suppressHydrationWarning
    >
      <div className="card w-full max-w-md" suppressHydrationWarning>
        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === "login" ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">
              Email
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
              }}
              render={({ field }) => (
                <InputText
                  id="email"
                  {...field}
                  value={field.value || ""}
                  className={
                    errors.email
                      ? "p-invalid !bg-red-50 dark:!bg-red-900/20"
                      : ""
                  }
                  placeholder="you@example.com"
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
              Password
            </label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: { value: 6, message: "Min length is 6" },
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
                  placeholder="******"
                />
              )}
            />
            {errors.password && (
              <small className="p-error text-red-600 dark:text-red-400">
                {errors.password.message}
              </small>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !!errors.email || !!errors.password}
            className="w-full text-lg px-6 py-3"
          >
            {isPending
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
                ? "Login"
                : "Register"}
          </Button>

          <Button
            type="button"
            severity="secondary"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
            className="w-full"
          >
            {mode === "login" ? "Create account" : "I already have an account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
