"use client";

import type { Room } from "@mm-preview/sdk";
import { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

export function useWebSocketMyRooms(userId: string, enabled = true) {
  const { isConnected, getMyRooms, on } = useWebSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const handleMyRooms = (data: { rooms: Room[] }) => {
      setRooms(data.rooms || []);
      setIsLoading(false);
    };

    const handleError = (error: {
      message: string;
      code: string;
      event?: string;
    }) => {
      if (error.event === "getMyRooms") {
        setIsLoading(false);
      }
    };

    // Подписываемся на события
    const unsubscribeMyRooms = on("myRooms", handleMyRooms);
    const unsubscribeError = on("error", handleError);

    return () => {
      unsubscribeMyRooms();
      unsubscribeError();
    };
  }, [enabled, userId, on]);

  // Запрашиваем комнаты при подключении
  useEffect(() => {
    if (enabled && userId && isConnected) {
      setIsLoading(true);
      getMyRooms();
    }
  }, [isConnected, enabled, userId, getMyRooms]);

  const refreshRooms = () => {
    if (isConnected) {
      setIsLoading(true);
      getMyRooms();
    }
  };

  return {
    rooms,
    isLoading,
    isConnected,
    refreshRooms,
  };
}
