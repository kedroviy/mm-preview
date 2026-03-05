"use client";

import { notificationService } from "@mm-preview/ui";
import { useCallback } from "react";
import { useWebSocketChat } from "@/src/shared/hooks/useWebSocketChat";

export function useChat({
  roomId,
  publicCode,
  userId,
  enabled,
}: {
  roomId: string;
  publicCode?: string;
  userId: string;
  enabled: boolean;
}) {
  const handleError = useCallback((error: Error) => {
    console.error("Chat error:", error);
    notificationService.showError(error.message || "Ошибка подключения к чату");
  }, []);

  const { messages, isConnected, isMuted, isReadyToSend, sendMessage } =
    useWebSocketChat({
      roomId,
      publicCode,
      userId,
      enabled,
      onError: handleError,
    });

  return {
    messages,
    isConnected,
    isMuted,
    isReadyToSend,
    sendMessage,
  };
}
