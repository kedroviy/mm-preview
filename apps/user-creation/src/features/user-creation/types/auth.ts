export type AuthMode = "login" | "register";

export type AuthFormModeStatus = "idle" | "submitting" | "doneAuthorize";

export interface AuthFormModeState {
  status: AuthFormModeStatus;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  mode: AuthFormModeState;
}

export type GoogleCredentialResponse = {
  credential?: string;
};

export type GoogleAccountsId = {
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
