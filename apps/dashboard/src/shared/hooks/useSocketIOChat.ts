"use client";

import type { ChatMessage } from "@mm-preview/sdk";
import {
  getAccessToken,
  getWebSocketRoomsUrl,
  setAccessToken,
} from "@mm-preview/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface UseSocketIOChatOptions {
  roomId?: string;
  publicCode?: string;
  userId: string;
  enabled?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onHistory?: (messages: ChatMessage[]) => void;
  onRoomUpdate?: (data: any) => void;
  onTokenRefreshed?: (accessToken: string) => void;
  onError?: (error: Error) => void;
}

export function useSocketIOChat({
  roomId,
  publicCode,
  userId,
  enabled = true,
  onMessage,
  onHistory,
  onRoomUpdate,
  onTokenRefreshed,
  onError,
}: UseSocketIOChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !userId) {
      return;
    }

    try {
      // Пытаемся получить токен из cookies
      // Если cookie HTTP-only, document.cookie её не увидит,
      // но браузер автоматически отправит её при подключении Socket.IO
      const token = getAccessToken();

      // Логируем для отладки
      if (token) {
        console.log("Found access token in cookies");
      } else {
        console.log("No access token in document.cookie (may be HTTP-only)");
        console.log(
          "Socket.IO will use cookies automatically if they are HTTP-only",
        );
      }

      // Формируем URL для Socket.IO
      // WebSocket всегда использует прямой URL (не может быть проксирован)
      const socketUrl = getWebSocketRoomsUrl();

      console.log("Connecting to Socket.IO:", socketUrl);

      // Socket.IO конфигурация
      // Если токен есть в document.cookie, передаем его в auth
      // Если cookie HTTP-only, она отправится автоматически браузером
      // withCredentials: true гарантирует отправку cookies
      const socketConfig: any = {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        withCredentials: true, // Включаем передачу cookies (включая HTTP-only)
      };

      // Если токен доступен, передаем его в auth
      // Если нет, но cookie HTTP-only, она все равно отправится автоматически
      if (token) {
        socketConfig.auth = {
          token: token,
        };
      } else {
        // Даже если токена нет в document.cookie, пробуем подключиться
        // HTTP-only cookies отправятся автоматически
        console.log(
          "Connecting without explicit token (using HTTP-only cookies)",
        );
      }

      const socket = io(socketUrl, socketConfig);

      // Connection events
      socket.on("connect", () => {
        setIsConnected(true);
        console.log("✅ Socket.IO connected");
      });

      socket.on("disconnect", (reason) => {
        setIsConnected(false);
        console.log("❌ Socket.IO disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket.IO connection error:", error.message);
        onError?.(new Error(`Ошибка подключения: ${error.message}`));
      });

      // Room events
      socket.on(
        "joinedRoom",
        (data: { roomId: string; publicCode: string; room: any }) => {
          currentRoomIdRef.current = data.roomId;
          setIsMuted(data.room.isMuted || false);
          console.log("✅ Joined room:", data.roomId);

          if (data.room.isMuted && data.room.muteExpiresAt) {
            const minutesLeft = Math.ceil(
              (data.room.muteExpiresAt - Date.now()) / (60 * 1000),
            );
            console.warn(`⚠️ You are muted for ${minutesLeft} more minute(s)`);
          }
        },
      );

      socket.on("leftRoom", (data: { roomId: string }) => {
        if (currentRoomIdRef.current === data.roomId) {
          currentRoomIdRef.current = null;
        }
        console.log("👋 Left room:", data.roomId);
      });

      // Chat events
      socket.on(
        "chatHistory",
        (data: { roomId: string; messages: ChatMessage[] }) => {
          console.log(
            "📜 Chat history received:",
            data.messages.length,
            "messages",
          );
          setMessages(data.messages);
          onHistory?.(data.messages);
        },
      );

      socket.on(
        "newMessage",
        (data: { roomId: string; message: ChatMessage }) => {
          console.log("💬 New message:", data.message);
          setMessages((prev) => [...prev, data.message]);
          onMessage?.(data.message);
        },
      );

      // Room updates
      socket.on(
        "roomUpdate",
        (data: {
          roomId: string;
          room: any;
          event: string;
          userId?: string;
        }) => {
          console.log("🔄 Room update:", data.event);
          setIsMuted(data.room.isMuted || false);
          onRoomUpdate?.(data);
        },
      );

      // Token refresh (auto-sent on connection if refresh token is valid)
      socket.on(
        "tokenRefreshed",
        (data: { accessToken: string; message?: string }) => {
          console.log(
            "🔄 Token refreshed via WebSocket:",
            data.message || "New access token received",
          );
          // Сохраняем новый токен в cookie
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
          onTokenRefreshed?.(data.accessToken);
        },
      );

      // Error handling
      socket.on(
        "error",
        (error: { message: string; code: string; event?: string }) => {
          console.error("❌ Socket.IO error:", error.message, error.code);
          onError?.(new Error(error.message || "Socket.IO error"));
        },
      );

      socketRef.current = socket;

      // Join room if we have publicCode
      if (publicCode && userId) {
        socket.emit("joinRoom", {
          publicCode,
          userId,
        });
        console.log("Sent joinRoom for publicCode:", publicCode);
      } else if (roomId && userId) {
        // If we have roomId but no publicCode, we might need to get it first
        // Or the backend might accept roomId directly - check backend docs
        console.warn("No publicCode provided, cannot join room via Socket.IO");
      }
    } catch (error) {
      console.error("Failed to create Socket.IO connection:", error);
      onError?.(error as Error);
    }
  }, [
    enabled,
    userId,
    roomId,
    publicCode,
    onMessage,
    onHistory,
    onRoomUpdate,
    onTokenRefreshed,
    onError,
  ]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!socketRef.current) {
        onError?.(new Error("Socket.IO не инициализирован"));
        return;
      }

      if (!currentRoomIdRef.current) {
        onError?.(new Error("Вы не в комнате"));
        return;
      }

      if (isMuted) {
        onError?.(new Error("Вы не можете отправлять сообщения (заглушены)"));
        return;
      }

      if (socketRef.current.connected) {
        const payload = {
          roomId: currentRoomIdRef.current,
          message: message.trim(),
        };
        console.log("Sending message:", payload);
        socketRef.current.emit("sendMessage", payload);
      } else {
        onError?.(new Error("Socket.IO не подключен"));
      }
    },
    [isMuted, onError],
  );

  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !currentRoomIdRef.current || !userId) {
      return;
    }

    socketRef.current.emit("leaveRoom", {
      roomId: currentRoomIdRef.current,
      userId,
    });
  }, [userId]);

  useEffect(() => {
    // Подключаемся только если есть publicCode (нужен для joinRoom)
    if (enabled && userId && publicCode) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      currentRoomIdRef.current = null;
    };
  }, [enabled, userId, publicCode, connect]);

  const getMyRooms = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("Requesting my rooms...");
      socketRef.current.emit("getMyRooms", {});
    } else {
      onError?.(new Error("Socket.IO не подключен"));
    }
  }, [onError]);

  const reconnectToRoom = useCallback(
    (roomIdToReconnect: string, publicCodeToReconnect: string) => {
      if (!socketRef.current?.connected) {
        onError?.(new Error("Socket.IO не подключен"));
        return;
      }

      if (!userId) {
        onError?.(new Error("User ID не указан"));
        return;
      }

      console.log(
        "Reconnecting to room:",
        roomIdToReconnect,
        "with code:",
        publicCodeToReconnect,
      );
      socketRef.current.emit("joinRoom", {
        publicCode: publicCodeToReconnect,
        userId,
      });
    },
    [userId, onError],
  );

  return {
    messages,
    isConnected,
    isMuted,
    sendMessage,
    leaveRoom,
    getMyRooms,
    reconnectToRoom,
    socket: socketRef.current,
  };
}
