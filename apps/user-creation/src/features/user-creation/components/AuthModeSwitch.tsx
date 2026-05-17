"use client";

import { Button } from "@mm-preview/ui";

interface AuthModeSwitchProps {
  label: string;
  isLoading: boolean;
  onSwitch: () => void;
}

export function AuthModeSwitch({
  label,
  isLoading,
  onSwitch,
}: AuthModeSwitchProps) {
  return (
    <Button
      type="button"
      severity="secondary"
      text
      onClick={onSwitch}
      disabled={isLoading}
      className="w-full"
    >
      {label}
    </Button>
  );
}
