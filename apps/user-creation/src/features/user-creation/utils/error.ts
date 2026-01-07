import type { ApiError } from "@mm-preview/sdk";

export function getErrorMessage(error: unknown, fallback: string): string {
  if ((error as ApiError)?.message) {
    return (error as ApiError).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
