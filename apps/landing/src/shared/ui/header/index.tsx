"use client";

import { Button } from "@mm-preview/ui";
import { APP_URLS } from "@/src/shared/config/constants";

export function Header() {
  const handleStart = () => {
    window.location.href = APP_URLS.USER_CREATION;
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-surface-0/80 backdrop-blur-sm border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">Movie Match</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleStart}
              className="px-6 py-2 text-base rounded"
            >
              Начать
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
