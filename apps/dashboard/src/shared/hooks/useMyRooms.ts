"use client";

import type { Room } from "@mm-preview/sdk";
import { getAccessToken, setAccessToken } from "@mm-preview/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface MyRoomsResponse {
  rooms: Room[];
}

export function useMyRooms(userId: string, enabled = true) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !userId) return;

    try {
      const token = getAccessToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const wsUrl = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
      const socketUrl = `${wsProtocol}//${wsUrl}/rooms`;

      console.log("Connecting to Socket.IO for my rooms:", socketUrl);

      const socketConfig: any = {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        withCredentials: true,
      };

      if (token) {
        socketConfig.auth = { token };
      }

      const socket = io(socketUrl, socketConfig);

      socket.on("connect", () => {
        setIsConnected(true);
        console.log("✅ Socket.IO connected for my rooms");

        // Запрашиваем комнаты после подключения
        socket.emit("getMyRooms", {});
        setIsLoading(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("❌ Socket.IO disconnected for my rooms");
      });

      socket.on(
        "tokenRefreshed",
        (data: { accessToken: string; message?: string }) => {
          console.log(
            "🔄 Token refreshed via WebSocket in useMyRooms:",
            data.message || "New access token received",
          );
          // Сохраняем новый токен в cookie
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
        },
      );

      socket.on("myRooms", (data: MyRoomsResponse) => {
        console.log("📋 My rooms received:", data.rooms.length, "rooms");
        setRooms(data.rooms || []);
        setIsLoading(false);
      });

      socket.on("error", (error: { message: string; code: string }) => {
        console.error("❌ Socket.IO error in useMyRooms:", error.message);
        setIsLoading(false);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error(
        "Failed to create Socket.IO connection for my rooms:",
        error,
      );
      setIsLoading(false);
    }
  }, [enabled, userId, getCookie]);

  useEffect(() => {
    if (enabled && userId) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, userId, connect]);

  const refreshRooms = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("getMyRooms", {});
      setIsLoading(true);
    }
  }, []);

  return {
    rooms,
    isLoading,
    isConnected,
    refreshRooms,
  };
}
