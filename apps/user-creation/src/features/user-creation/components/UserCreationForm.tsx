"use client";

import { authApi } from "@mm-preview/sdk";
import { Button, InputText, notificationService } from "@mm-preview/ui";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getAppUrls } from "@/src/shared/config/constants";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import { getErrorMessage } from "../utils/error";

interface UserFormData {
  name: string;
}

export function UserCreationForm() {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    defaultValues: {
      name: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const redirectToDashboard = (userId: string) => {
    const dashboardUrl = getAppUrls().DASHBOARD;
    window.location.href = `${dashboardUrl}/${userId}/rooms`;
  };

  const onSubmit = async (data: UserFormData) => {
    setIsPending(true);
    try {
      const loginRes = await authApi.login({ name: data.name });
      const userId = loginRes.data?.userId;
      if (!userId) {
        throw new Error("No userId in response");
      }

      notificationService.showSuccess("Logged in");
      redirectToDashboard(userId);
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
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <Controller
              name="name"
              control={control}
              rules={{
                required: "Name is required",
                minLength: { value: 1, message: "Name is required" },
                maxLength: { value: 100, message: "Max length is 100" },
              }}
              render={({ field }) => (
                <InputText
                  id="name"
                  {...field}
                  value={field.value || ""}
                  className={
                    errors.name
                      ? "p-invalid !bg-red-50 dark:!bg-red-900/20"
                      : ""
                  }
                  placeholder="John Doe"
                />
              )}
            />
            {errors.name && (
              <small className="p-error text-red-600 dark:text-red-400">
                {errors.name.message}
              </small>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !!errors.name}
            className="w-full text-lg px-6 py-3"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
