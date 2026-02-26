"use client";

import { useEffect } from "react";

/**
 * Handles ChunkLoadError that occurs after a new deployment when the browser
 * tries to load old cached chunk URLs that no longer exist on the server.
 * Automatically reloads the page once to fetch the latest chunks.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const isChunkError =
        event.message?.includes("ChunkLoadError") ||
        event.message?.includes("Loading chunk") ||
        event.error?.name === "ChunkLoadError";

      if (!isChunkError) return;

      const reloadKey = "chunk_error_reload";
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      // Reload once per 30 seconds to avoid infinite reload loops
      if (!lastReload || now - Number(lastReload) > 30_000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return null;
}
