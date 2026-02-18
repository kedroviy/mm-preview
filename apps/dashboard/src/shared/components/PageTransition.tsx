"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * PageTransition component that applies view transition names based on route
 * This enables smooth transitions between pages using CSS View Transitions API
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [transitionName, setTransitionName] = useState("page");

  useEffect(() => {
    // Set view transition name based on route
    if (!pathname) return;
    
    if (pathname.includes("/rooms/")) {
      setTransitionName("room-detail");
    } else if (pathname.includes("/rooms")) {
      setTransitionName("rooms-list");
    } else {
      setTransitionName("dashboard");
    }
  }, [pathname]);

  return (
    <div
      style={{
        viewTransitionName: transitionName,
      }}
    >
      {children}
    </div>
  );
}

