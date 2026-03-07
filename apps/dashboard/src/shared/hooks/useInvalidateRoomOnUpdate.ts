"use client";

import type { RoomMember } from "@mm-preview/sdk";
import { roomKeys } from "@mm-preview/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

type RoomUpdatePayload = {
  roomId: string;
  /** Если бэкенд присылает участников в roomUpdate — обновляем кэш без HTTP-запроса */
  members?: RoomMember[];
};

/**
 * Подписывается на roomUpdate по WebSocket.
 * Комнату всегда инвалидируем (refetch), чтобы не перезаписать кэш частичным room из события
 * и не сломать чат (useChat зависит от room.isMember из useRoom).
 * Участников обновляем из события без запроса, если пришли data.members; иначе инвалидируем.
 */
export function useInvalidateRoomOnUpdate() {
  const queryClient = useQueryClient();
  const { on } = useWebSocket();

  useEffect(() => {
    const unsubscribe = on("roomUpdate", (data: RoomUpdatePayload) => {
      if (!data.roomId) return;

      const detailKey = roomKeys.detail(data.roomId);
      const membersKey = [...detailKey, "members"] as const;

      queryClient.invalidateQueries({ queryKey: detailKey });

      if (data.members != null) {
        queryClient.setQueryData(membersKey, data.members);
      } else {
        queryClient.invalidateQueries({ queryKey: membersKey });
      }
    });
    return unsubscribe;
  }, [on, queryClient]);
}
