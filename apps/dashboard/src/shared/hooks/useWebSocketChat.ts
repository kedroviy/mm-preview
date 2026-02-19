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
  const joiningRoomRef = useRef<string | null>(null); // Отслеживаем, к какой комнате мы присоединяемся
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Таймаут для присоединения

  // Очищаем состояние при изменении roomId
  useEffect(() => {
    if (previousRoomIdRef.current !== roomId) {
      if (previousRoomIdRef.current !== undefined) {
        // Очищаем сообщения при переходе в другую комнату
        setMessages([]);
      }
      // Очищаем таймаут присоединения, если он есть
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
      previousRoomIdRef.current = roomId;
      joinedRoomRef.current = null;
      joiningRoomRef.current = null; // Сбрасываем флаг присоединения
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
        joiningRoomRef.current = null; // Сбрасываем флаг присоединения
        // Очищаем таймаут присоединения
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
          joinTimeoutRef.current = null;
        }
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
      if (error.event === "joinRoom") {
        // При ошибке присоединения сбрасываем флаг
        joiningRoomRef.current = null;
      }
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
    // 3. Мы еще не присоединяемся к этой комнате (проверяем через joiningRoomRef)
    // 4. roomId существует
    const shouldJoin =
      enabled &&
      isConnected &&
      publicCode &&
      userId &&
      roomId &&
      joinedRoomRef.current !== roomId &&
      joiningRoomRef.current !== roomId;

    if (shouldJoin) {
      // Очищаем предыдущий таймаут, если он есть
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
      }
      
      joiningRoomRef.current = roomId; // Устанавливаем флаг присоединения
      joinRoom(publicCode, userId);
      
      // Таймаут для присоединения (10 секунд)
      // Если присоединение не завершилось за это время, сбрасываем флаг
      joinTimeoutRef.current = setTimeout(() => {
        if (joiningRoomRef.current === roomId && joinedRoomRef.current !== roomId) {
          console.warn("⚠️ Таймаут присоединения к комнате:", roomId);
          joiningRoomRef.current = null;
          joinTimeoutRef.current = null;
          onError?.(new Error("Не удалось присоединиться к комнате. Пожалуйста, попробуйте еще раз."));
        }
      }, 10000);
    }

    return () => {
      unsubscribeChatHistory();
      unsubscribeNewMessage();
      unsubscribeJoinedRoom();
      unsubscribeRoomUpdate();
      unsubscribeError();
      // Очищаем таймаут при размонтировании
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
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

      // Проверяем, что roomId - это UUID, а не publicCode
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId);
      const isPublicCode = /^\d{6}$/.test(roomId);
      
      if (isPublicCode) {
        console.error("❌ ОШИБКА: В sendMessage передан publicCode вместо roomId:", roomId);
        onError?.(new Error("Ошибка: передан код комнаты вместо ID. Пожалуйста, обновите страницу."));
        return;
      }
      
      if (!isUUID) {
        console.warn("⚠️ roomId не похож на UUID:", roomId);
      }

      if (!isConnected) {
        onError?.(new Error("WebSocket не подключен. Пожалуйста, подождите подключения."));
        return;
      }

      // Проверяем, присоединились ли мы к комнате или присоединяемся
      if (joinedRoomRef.current !== roomId && joiningRoomRef.current !== roomId) {
        onError?.(new Error("Вы еще не присоединились к этой комнате. Пожалуйста, подождите."));
        return;
      }

      // Если мы еще присоединяемся, ждем завершения
      if (joiningRoomRef.current === roomId && joinedRoomRef.current !== roomId) {
        onError?.(new Error("Присоединение к комнате в процессе. Пожалуйста, подождите."));
        return;
      }

      if (isMuted) {
        onError?.(new Error("Вы не можете отправлять сообщения (заглушены)"));
        return;
      }

      console.log("💬 Отправка сообщения, roomId:", roomId, isUUID ? "(UUID)" : "(не UUID)");
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
