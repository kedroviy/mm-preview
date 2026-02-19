"use client";

import type { ChatMessage, Room } from "@mm-preview/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

interface UseWebSocketChatOptions {
  roomId?: string;
  publicCode?: string;
  userId: string;
  enabled?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onHistory?: (messages: ChatMessage[]) => void;
  onRoomUpdate?: (data: {
    roomId: string;
    room: Room;
    event: string;
    userId?: string;
  }) => void;
  onError?: (error: Error) => void;
}

export function useWebSocketChat({
  roomId,
  publicCode,
  userId,
  enabled = true,
  onMessage,
  onHistory,
  onRoomUpdate,
  onError,
}: UseWebSocketChatOptions) {
  const {
    isConnected,
    joinRoom,
    sendMessage: wsSendMessage,
    getCurrentRoomId,
    on,
    off,
  } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const joinedRoomRef = useRef<string | null>(null);
  const previousRoomIdRef = useRef<string | undefined>(undefined);

  // Очищаем состояние при изменении roomId
  useEffect(() => {
    if (previousRoomIdRef.current !== roomId) {
      if (previousRoomIdRef.current !== undefined) {
        // Очищаем сообщения при переходе в другую комнату
        setMessages([]);
      }
      previousRoomIdRef.current = roomId;
      joinedRoomRef.current = null;
    }
  }, [roomId]);

  // Подписываемся на события чата
  useEffect(() => {
    if (!enabled || !userId) return;

    const handleChatHistory = (data: {
      roomId: string;
      messages: ChatMessage[];
    }) => {
      if (roomId && data.roomId === roomId) {
        setMessages(data.messages);
        onHistory?.(data.messages);
      }
    };

    const handleNewMessage = (data: {
      roomId: string;
      message: ChatMessage;
    }) => {
      if (roomId && data.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
        onMessage?.(data.message);
      }
    };

    const handleJoinedRoom = (data: {
      roomId: string;
      publicCode: string;
      room: Room;
    }) => {
      if (roomId && data.roomId === roomId) {
        joinedRoomRef.current = data.roomId;
        setIsMuted(data.room.isMuted || false);
        if (data.room.muteExpiresAt && data.room.isMuted) {
          const minutesLeft = Math.ceil(
            (data.room.muteExpiresAt - Date.now()) / (60 * 1000),
          );
          console.warn(`⚠️ Вы заглушены на ${minutesLeft} минут(ы)`);
        }
      }
    };

    const handleRoomUpdate = (data: {
      roomId: string;
      room: Room;
      event: string;
      userId?: string;
    }) => {
      if (roomId && data.roomId === roomId) {
        setIsMuted(data.room.isMuted || false);
        onRoomUpdate?.(data);
      }
    };

    const handleError = (error: {
      message: string;
      code: string;
      event?: string;
    }) => {
      if (error.event === "sendMessage" || error.event === "joinRoom") {
        onError?.(new Error(error.message));
      }
    };

    // Подписываемся на события
    const unsubscribeChatHistory = on("chatHistory", handleChatHistory);
    const unsubscribeNewMessage = on("newMessage", handleNewMessage);
    const unsubscribeJoinedRoom = on("joinedRoom", handleJoinedRoom);
    const unsubscribeRoomUpdate = on("roomUpdate", handleRoomUpdate);
    const unsubscribeError = on("error", handleError);

    // Присоединяемся к комнате только если:
    // 1. enabled, isConnected, publicCode и userId доступны
    // 2. Мы еще не присоединены к этой комнате (проверяем через joinedRoomRef)
    // 3. roomId существует
    const shouldJoin =
      enabled &&
      isConnected &&
      publicCode &&
      userId &&
      roomId &&
      joinedRoomRef.current !== roomId;

    if (shouldJoin) {
      joinRoom(publicCode, userId);
    }

    return () => {
      unsubscribeChatHistory();
      unsubscribeNewMessage();
      unsubscribeJoinedRoom();
      unsubscribeRoomUpdate();
      unsubscribeError();
    };
  }, [
    enabled,
    userId,
    roomId,
    publicCode,
    isConnected,
    joinRoom,
    getCurrentRoomId,
    on,
    off,
    onMessage,
    onHistory,
    onRoomUpdate,
    onError,
  ]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!roomId) {
        onError?.(new Error("roomId не указан"));
        return;
      }

      if (!isConnected) {
        onError?.(new Error("WebSocket не подключен. Пожалуйста, подождите подключения."));
        return;
      }

      if (joinedRoomRef.current !== roomId) {
        onError?.(new Error("Вы еще не присоединились к этой комнате. Пожалуйста, подождите."));
        return;
      }

      if (isMuted) {
        onError?.(new Error("Вы не можете отправлять сообщения (заглушены)"));
        return;
      }

      wsSendMessage(roomId, message);
    },
    [roomId, isMuted, isConnected, wsSendMessage, onError],
  );

  return {
    messages,
    isConnected,
    isMuted,
    sendMessage,
  };
}
