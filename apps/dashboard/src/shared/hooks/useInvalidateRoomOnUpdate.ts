"use client";

import type { Room, RoomMember } from "@mm-preview/sdk";
import { roomKeys } from "@mm-preview/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

type RoomUpdatePayload = {
  roomId: string;
  room?: Room;
  /** Если бэкенд присылает участников в roomUpdate — обновляем кэш без HTTP-запроса */
  members?: RoomMember[];
};

/**
 * Подписывается на roomUpdate по WebSocket. Если в событии есть room и/или members —
 * обновляет кэш React Query без HTTP-запросов. Иначе инвалидирует запросы (будет refetch).
 */
export function useInvalidateRoomOnUpdate() {
  const queryClient = useQueryClient();
  const { on } = useWebSocket();

  useEffect(() => {
    const unsubscribe = on("roomUpdate", (data: RoomUpdatePayload) => {
      if (!data.roomId) return;

      const detailKey = roomKeys.detail(data.roomId);
      const membersKey = [...detailKey, "members"] as const;

      if (data.room != null) {
        queryClient.setQueryData(detailKey, data.room);
      } else {
        queryClient.invalidateQueries({ queryKey: detailKey });
      }

      if (data.members != null) {
        queryClient.setQueryData(membersKey, data.members);
      } else {
        queryClient.invalidateQueries({ queryKey: membersKey });
      }
    });
    return unsubscribe;
  }, [on, queryClient]);
}
