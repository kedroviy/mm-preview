"use client";

import { FormProvider } from "react-hook-form";
import { useTranslation } from "@/src/shared/i18n/useTranslation";
import { useAuthForm } from "../hooks/useAuthForm";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import type { AuthMode } from "../types/auth";
import { selectAuthUiState } from "../utils/auth-form-mode";
import { AuthCredentialsForm } from "./AuthCredentialsForm";
import { AuthFormLayout } from "./AuthFormLayout";
import { AuthFormLoadingOverlay } from "./AuthFormLoadingOverlay";
import { AuthGoogleLoading } from "./AuthGoogleLoading";
import { AuthModeSwitch } from "./AuthModeSwitch";

interface UserCreationFormProps {
  mode: AuthMode;
}

export function UserCreationForm({ mode: authMode }: UserCreationFormProps) {
  const { t } = useTranslation();
  const {
    form,
    formMode,
    isMutationPending,
    isAuthBusy,
    onSubmit,
    switchMode,
    applyAuthError,
    runTokenLogin,
    googleAuth,
    clearRootError,
    setRootError,
    setFormMode,
  } = useAuthForm(authMode);

  const { isDoneAuthorize, isLoading } = selectAuthUiState(
    formMode,
    isMutationPending,
  );

  const { signInWithGoogle, isClientIdMissing } = useGoogleSignIn({
    applyAuthError,
    clearRootError,
    googleAuth,
    isAuthBusy,
    runTokenLogin,
    setFormMode,
    setRootError,
    translate: t,
  });

  const title = authMode === "login" ? t("titleLogin") : t("titleRegister");
  const switchLabel =
    authMode === "login" ? t("switchToRegister") : t("switchToLogin");

  return (
    <AuthFormLayout title={title}>
      {isDoneAuthorize ? (
        <AuthGoogleLoading
          title={t("authDoneTitle")}
          hint={t("authDoneHint")}
        />
      ) : (
        <div className="relative">
          <FormProvider {...form}>
            <AuthCredentialsForm
              authMode={authMode}
              onSubmit={onSubmit}
              translate={t}
              onGoogleSignIn={signInWithGoogle}
              isClientIdMissing={isClientIdMissing}
              isMutationPending={isMutationPending}
            />

            <AuthModeSwitch label={switchLabel} onSwitch={switchMode} />
          </FormProvider>

          {isLoading && <AuthFormLoadingOverlay />}
        </div>
      )}
    </AuthFormLayout>
  );
}
