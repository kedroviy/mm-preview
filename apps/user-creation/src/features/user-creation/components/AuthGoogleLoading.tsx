"use client";

interface AuthGoogleLoadingProps {
  title: string;
  hint: string;
}

export function AuthGoogleLoading({ title, hint }: AuthGoogleLoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mm-auth-google-loading relative h-16 w-16" aria-hidden>
        <span className="mm-auth-google-loading__ring mm-auth-google-loading__ring--outer" />
        <span className="mm-auth-google-loading__ring mm-auth-google-loading__ring--inner" />
        <span className="mm-auth-google-loading__core" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-base font-semibold text-[var(--color-primary)]">
          {title}
        </p>
        <p className="text-sm text-[var(--color-neutral)]">{hint}</p>
      </div>
    </div>
  );
}
