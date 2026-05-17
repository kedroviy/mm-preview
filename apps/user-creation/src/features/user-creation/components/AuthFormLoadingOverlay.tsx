"use client";

export function AuthFormLoadingOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mm-auth-google-loading relative h-14 w-14" aria-hidden>
        <span className="mm-auth-google-loading__ring mm-auth-google-loading__ring--outer" />
        <span className="mm-auth-google-loading__ring mm-auth-google-loading__ring--inner" />
        <span className="mm-auth-google-loading__core" />
      </div>
    </div>
  );
}
