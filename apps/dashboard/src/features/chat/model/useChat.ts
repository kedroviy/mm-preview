"use client";

import { notificationService } from "@mm-preview/ui";
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
  const { messages, isConnected, isMuted, sendMessage } = useWebSocketChat({
    roomId,
    publicCode,
    userId,
    enabled,
    onError: (error) => {
      console.error("Chat error:", error);
      notificationService.showError(
        error.message || "Ошибка подключения к чату",
      );
    },
  });

  return {
    messages,
    isConnected,
    isMuted,
    sendMessage,
  };
}
