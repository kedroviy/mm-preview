"use client";

import { Button } from "@mm-preview/ui";
import { useFormContext, useWatch } from "react-hook-form";
import type { TranslationKey } from "@/src/shared/i18n/locales";
import { GoogleSignInSection } from "./GoogleSignInSection";
import {
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../constants/validation";
import type { AuthFormData, AuthMode } from "../types/auth";
import { AUTH_FORM_MODE } from "../utils/auth-form-mode";
import { AuthFormField } from "./AuthFormField";

interface AuthCredentialsFormProps {
  authMode: AuthMode;
  onSubmit: (values: AuthFormData) => Promise<void>;
  translate: (key: TranslationKey) => string;
  onGoogleSignIn: () => void;
  isClientIdMissing: boolean;
  isMutationPending: boolean;
}

export function AuthCredentialsForm({
  authMode,
  onSubmit,
  translate,
  onGoogleSignIn,
  isClientIdMissing,
  isMutationPending,
}: AuthCredentialsFormProps) {
  const {
    handleSubmit,
    getValues,
    formState: { errors },
  } = useFormContext<AuthFormData>();

  const formMode = useWatch({ name: "mode" });
  const isDisabled =
    formMode.status !== AUTH_FORM_MODE.IDLE || isMutationPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <AuthFormField
        name="email"
        label={translate("emailLabel")}
        type="email"
        placeholder={translate("emailPlaceholder")}
        disabled={isDisabled}
        rules={{
          required: translate("emailRequired"),
          maxLength: {
            value: EMAIL_MAX_LENGTH,
            message: translate("emailMaxLength"),
          },
          pattern: {
            value: EMAIL_PATTERN,
            message: translate("emailInvalid"),
          },
        }}
      />

      <AuthFormField
        name="password"
        label={translate("passwordLabel")}
        type="password"
        placeholder={translate("passwordPlaceholder")}
        disabled={isDisabled}
        rules={{
          required: translate("passwordRequired"),
          minLength: {
            value: PASSWORD_MIN_LENGTH,
            message: translate("passwordMinLength"),
          },
          maxLength: {
            value: PASSWORD_MAX_LENGTH,
            message: translate("passwordMaxLength"),
          },
        }}
      />

      {authMode === "register" && (
        <AuthFormField
          name="confirmPassword"
          label={translate("confirmPasswordLabel")}
          type="password"
          placeholder={translate("confirmPasswordPlaceholder")}
          disabled={isDisabled}
          rules={{
            required: translate("confirmPasswordRequired"),
            validate: (value) =>
              value === getValues("password") ||
              translate("passwordsDontMatch"),
          }}
        />
      )}

      {errors.root?.serverError && (
        <small className="p-error text-red-600 dark:text-red-400">
          {errors.root.serverError.message}
        </small>
      )}

      <div className="mm-auth-actions relative flex min-h-[60px] flex-col items-center">
        <div className="flex flex-1 justify-center">
          <Button
            type="submit"
            disabled={isDisabled}
            className="mm-auth-submit h-10 min-h-10 px-8 text-sm"
          >
            {authMode === "login"
              ? translate("submitLogin")
              : translate("submitRegister")}
          </Button>
        </div>
        {authMode === "login" && (
          <div className="self-end">
            <GoogleSignInSection
              onGoogleSignIn={onGoogleSignIn}
              isClientIdMissing={isClientIdMissing}
              isDisabled={isDisabled}
              clientIdMissingText={translate("googleClientIdMissing")}
            />
          </div>
        )}
      </div>
    </form>
  );
}
