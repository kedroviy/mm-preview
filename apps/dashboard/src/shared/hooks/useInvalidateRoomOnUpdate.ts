"use client";

import { roomKeys } from "@mm-preview/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

/**
 * Подписывается на roomUpdate по WebSocket и инвалидирует запросы комнаты и участников,
 * чтобы у всех в комнате обновлялось состояние (список участников, данные комнаты).
 */
export function useInvalidateRoomOnUpdate() {
  const queryClient = useQueryClient();
  const { on } = useWebSocket();

  useEffect(() => {
    const unsubscribe = on("roomUpdate", (data: { roomId: string }) => {
      if (data.roomId) {
        queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
        queryClient.invalidateQueries({
          queryKey: [...roomKeys.detail(data.roomId), "members"],
        });
      }
    });
    return unsubscribe;
  }, [on, queryClient]);
}
