import type { AuthFormModeState } from "../types/auth";

export const AUTH_FORM_MODE = {
  IDLE: "idle",
  SUBMITTING: "submitting",
  DONE_AUTHORIZE: "doneAuthorize",
} as const;

export const defaultAuthFormMode: AuthFormModeState = {
  status: AUTH_FORM_MODE.IDLE,
};

export function selectAuthUiState(
  formMode: AuthFormModeState,
  isMutationPending: boolean,
) {
  const isDoneAuthorize = formMode.status === AUTH_FORM_MODE.DONE_AUTHORIZE;
  const isLoading =
    !isDoneAuthorize &&
    (formMode.status === AUTH_FORM_MODE.SUBMITTING || isMutationPending);
  const isInteractionBlocked =
    isDoneAuthorize || formMode.status !== AUTH_FORM_MODE.IDLE;

  return { isDoneAuthorize, isLoading, isInteractionBlocked };
}
