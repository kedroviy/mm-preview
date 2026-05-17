"use client";

import { FormProvider } from "react-hook-form";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import { useAuthForm } from "../hooks/useAuthForm";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import type { AuthMode } from "../types/auth";
import { AuthCredentialsForm } from "./AuthCredentialsForm";
import { AuthFormLayout } from "./AuthFormLayout";
import { AuthModeSwitch } from "./AuthModeSwitch";

interface UserCreationFormProps {
  mode: AuthMode;
}

export function UserCreationForm({ mode }: UserCreationFormProps) {
  const { t } = useTranslation();
  const {
    form,
    isLoading,
    isLoadingRef,
    onSubmit,
    switchMode,
    applyAuthError,
    runTokenLogin,
    googleAuth,
    clearRootError,
    setRootError,
  } = useAuthForm(mode);

  const { signInWithGoogle, isClientIdMissing } = useGoogleSignIn({
    applyAuthError,
    clearRootError,
    googleAuth,
    isLoadingRef,
    runTokenLogin,
    setRootError,
    translate: t,
  });

  const title = mode === "login" ? t("titleLogin") : t("titleRegister");
  const switchLabel =
    mode === "login" ? t("switchToRegister") : t("switchToLogin");

  return (
    <AuthFormLayout title={title}>
      <FormProvider {...form}>
        <AuthCredentialsForm
          mode={mode}
          isLoading={isLoading}
          onSubmit={onSubmit}
          translate={t}
          onGoogleSignIn={signInWithGoogle}
          isClientIdMissing={isClientIdMissing}
        />
      </FormProvider>

      <AuthModeSwitch
        label={switchLabel}
        isLoading={isLoading}
        onSwitch={switchMode}
      />
    </AuthFormLayout>
  );
}
