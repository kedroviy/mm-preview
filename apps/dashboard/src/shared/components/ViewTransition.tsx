"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";

interface ViewTransitionProps {
  children: ReactNode;
  className?: string;
  name?: string;
}

/**
 * ViewTransition wrapper component that uses CSS View Transitions API
 * Falls back gracefully if View Transitions are not supported
 */
export function ViewTransition({
  children,
  className,
  name,
}: ViewTransitionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Check if View Transitions are supported
  const supportsViewTransitions =
    typeof document !== "undefined" && "startViewTransition" in document;

  const handleTransition = (callback: () => void) => {
    if (supportsViewTransitions && document.startViewTransition) {
      document.startViewTransition(() => {
        startTransition(callback);
      });
    } else {
      startTransition(callback);
    }
  };

  return (
    <div
      className={className}
      style={
        name && supportsViewTransitions
          ? {
              viewTransitionName: name,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

/**
 * Hook to use ViewTransition-aware navigation
 */
export function useViewTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const supportsViewTransitions =
    typeof document !== "undefined" && "startViewTransition" in document;

  const navigate = (url: string) => {
    if (supportsViewTransitions && document.startViewTransition) {
      document.startViewTransition(() => {
        startTransition(() => {
          router.push(url);
        });
      });
    } else {
      startTransition(() => {
        router.push(url);
      });
    }
  };

  return { navigate, isPending };
}
