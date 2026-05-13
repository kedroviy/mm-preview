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
      message?: string;
      code: string;
      event?: string;
    }) => {
      if (error.event === "getMyRooms") {
        setIsLoading(false);
      }
    };

    // При обновлении комнаты (новый участник, выход, выбор фильма и т.д.) обновляем список комнат у всех в комнате
    const handleRoomUpdate = () => {
      if (isConnected) {
        getMyRooms();
      }
    };

    // Подписываемся на события
    const unsubscribeMyRooms = on("myRooms", handleMyRooms);
    const unsubscribeRoomUpdate = on("roomUpdate", handleRoomUpdate);
    const unsubscribeError = on("error", handleError);

    return () => {
      unsubscribeMyRooms();
      unsubscribeRoomUpdate();
      unsubscribeError();
    };
  }, [enabled, userId, on, isConnected, getMyRooms]);

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
