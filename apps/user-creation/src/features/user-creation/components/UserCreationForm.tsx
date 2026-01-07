"use client";

import type { User } from "@mm-preview/sdk";
import { Button, notificationService } from "@mm-preview/ui";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getAppUrls } from "@/src/shared/config/constants";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import { NAME_MIN_LENGTH, NAME_PATTERN } from "../constants/validation";
import { useCreateUser } from "../hooks/useCreateUser";
import { getErrorMessage } from "../utils/error";

interface UserFormData {
  name: string;
}

export function UserCreationForm() {
  const { t } = useTranslation();
  const [createdUser, setCreatedUser] = useState<User | null>(null);
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

  const { mutate, isPending } = useCreateUser();

  const handleContinue = () => {
    const urls = getAppUrls();
    window.location.href = urls.DASHBOARD;
  };

  const onSubmit = (data: UserFormData) => {
    mutate(
      {
        name: data.name,
      },
      {
        onSuccess: (user: unknown) => {
          setCreatedUser(user as User);
          Promise.resolve().then(() => {
            notificationService.showSuccess(t("successNotification"));
          });
        },
        onError: (error: unknown) => {
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
        },
      },
    );
  };

  if (createdUser) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">{t("successTitle")}</h1>
              <p className="text-lg text-muted-color">
                {t("successMessage")} <strong>{createdUser.name}</strong>{" "}
                {t("successCreated")}.
              </p>
            </div>
            <Button
              onClick={handleContinue}
              className="w-full text-lg px-6 py-3"
            >
              {t("successContinue")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{t("title")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium">
              {t("nameLabel")}
            </label>
            <Controller
              name="name"
              control={control}
              rules={{
                required: t("nameRequired"),
                minLength: {
                  value: NAME_MIN_LENGTH,
                  message: t("nameMinLength"),
                },
                pattern: {
                  value: NAME_PATTERN,
                  message: t("nameInvalid"),
                },
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
                  placeholder={t("namePlaceholder")}
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
            {isPending ? t("creating") : t("next")}
          </Button>
        </form>
      </div>
    </div>
  );
}
