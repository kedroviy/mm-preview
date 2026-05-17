import type { ReactNode } from "react";

interface AuthFormLayoutProps {
  title: string;
  children: ReactNode;
}

export function AuthFormLayout({ title, children }: AuthFormLayoutProps) {
  return (
    <div
      className="mm-auth flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-[#e8f0f6] to-[#c4d9ea] p-4"
      suppressHydrationWarning
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_-12px_rgba(39,76,119,0.25)] backdrop-blur-md sm:p-8"
        suppressHydrationWarning
      >
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
