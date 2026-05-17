"use client";

import { Button } from "@mm-preview/ui";
import { useWatch } from "react-hook-form";
import { AUTH_FORM_MODE } from "../utils/auth-form-mode";

interface AuthModeSwitchProps {
  label: string;
  onSwitch: () => void;
}

export function AuthModeSwitch({ label, onSwitch }: AuthModeSwitchProps) {
  const formMode = useWatch({ name: "mode" });
  const isDisabled = formMode.status !== AUTH_FORM_MODE.IDLE;

  return (
    <Button
      type="button"
      severity="secondary"
      text
      onClick={onSwitch}
      disabled={isDisabled}
      className="w-full"
    >
      {label}
    </Button>
  );
}
