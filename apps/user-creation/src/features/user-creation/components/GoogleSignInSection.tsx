"use client";

import { Button, GoogleIcon } from "@mm-preview/ui";

interface GoogleSignInSectionProps {
  onGoogleSignIn: () => void;
  isClientIdMissing: boolean;
  isDisabled: boolean;
  clientIdMissingText: string;
}

export function GoogleSignInSection({
  onGoogleSignIn,
  isClientIdMissing,
  isDisabled,
  clientIdMissingText,
}: GoogleSignInSectionProps) {
  return (
    <>
      {isClientIdMissing && (
        <small className="absolute -top-5 right-0 max-w-[60px] text-center text-[10px] leading-tight text-muted-color">
          {clientIdMissingText}
        </small>
      )}
      <Button
        size="xs"
        type="button"
        onClick={onGoogleSignIn}
        disabled={isDisabled || isClientIdMissing}
        className="mm-auth-google-btn flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(96,150,186,0.75)] bg-gradient-to-b from-white/95 to-[rgba(232,240,246,0.75)] transition-[border-color,box-shadow,background] duration-150 enabled:hover:border-[var(--color-steel-blue)] enabled:hover:shadow-[0_6px_18px_rgba(96,150,186,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Sign in with Google"
      >
        <GoogleIcon className="h-5 w-5" />
      </Button>
    </>
  );
}
