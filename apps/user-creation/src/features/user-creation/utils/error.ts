import type { TranslationKey } from "@/src/shared/i18n/locales";
import { AuthApiError } from "../api/auth";

type Translate = (key: TranslationKey) => string;

function formatRateLimitMessage(
  t: Translate,
  seconds: number | undefined,
): string {
  if (!seconds || Number.isNaN(seconds)) {
    return t("errorRateLimitedFallback");
  }
  return t("errorRateLimited").replace("{seconds}", String(seconds));
}

export function getAuthErrorMessage(error: unknown, t: Translate): string {
  if (error instanceof AuthApiError) {
    switch (error.code) {
      case "AUTH_USER_NOT_FOUND":
        return t("errorUserNotFound");
      case "AUTH_INVALID_CREDENTIALS":
        return t("errorInvalidCredentials");
      case "AUTH_LOGIN_RATE_LIMITED":
        return formatRateLimitMessage(t, error.retryAfterSeconds);
      case "AUTH_EMAIL_ALREADY_EXISTS":
        return t("errorEmailExists");
      case "AUTH_GOOGLE_INVALID_TOKEN":
        return t("errorGoogleInvalidToken");
      case "AUTH_GOOGLE_PROVIDER_MISMATCH":
        return t("errorGoogleProviderMismatch");
      case "AUTH_GOOGLE_EMAIL_NOT_IN_TOKEN":
        return t("errorGoogleEmailMissing");
      case "AUTH_GOOGLE_REGISTRATION_FAILED":
        return t("errorGoogleRegistrationFailed");
      default:
        return error.message || t("genericError");
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t("genericError");
}

export function getAuthErrorCode(error: unknown): string | null {
  if (error instanceof AuthApiError) {
    return error.code;
  }
  return null;
}
