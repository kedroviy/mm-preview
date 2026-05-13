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
    event?: string;
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
  } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isJoinedToRoom, setIsJoinedToRoom] = useState(false);
  const joinedRoomRef = useRef<string | null>(null);
  const previousRoomIdRef = useRef<string | undefined>(undefined);
  const joiningRoomRef = useRef<string | null>(null);
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessagesRef = useRef<string[]>([]);
  const prevConnectedRef = useRef(false);

  const onMessageRef = useRef(onMessage);
  const onHistoryRef = useRef(onHistory);
  const onRoomUpdateRef = useRef(onRoomUpdate);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onHistoryRef.current = onHistory;
  onRoomUpdateRef.current = onRoomUpdate;
  onErrorRef.current = onError;

  // При переподключении сбрасываем состояние присоединения, чтобы переподключиться к комнате
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current && joinedRoomRef.current) {
      joinedRoomRef.current = null;
      joiningRoomRef.current = null;
      pendingMessagesRef.current = [];
      setIsJoinedToRoom(false);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

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
      joiningRoomRef.current = null;
      pendingMessagesRef.current = [];
      setIsJoinedToRoom(false);
    }
  }, [roomId]);

  // Периодическая проверка состояния присоединения к комнате
  // На случай, если событие joinedRoom не пришло, но мы уже присоединены
  useEffect(() => {
    if (!enabled || !roomId || !isConnected) {
      return;
    }

    const checkRoomStatus = () => {
      const currentRoomId = getCurrentRoomId();
      if (currentRoomId === roomId && joinedRoomRef.current !== roomId) {
        console.log(
          "✅ Обнаружено присоединение через периодическую проверку, обновляем состояние",
        );
        joinedRoomRef.current = roomId;
        joiningRoomRef.current = null;
        setIsJoinedToRoom(true);
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
          joinTimeoutRef.current = null;
        }
      }
    };

    // Проверяем сразу
    checkRoomStatus();

    // Проверяем каждые 2 секунды
    const interval = setInterval(checkRoomStatus, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, roomId, isConnected, getCurrentRoomId]);

  // Подписываемся на события чата
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const handleChatHistory = (data: {
      roomId: string;
      messages: ChatMessage[];
    }) => {
      if (roomId && data.roomId === roomId) {
        setMessages(data.messages);
        onHistoryRef.current?.(data.messages);
      }
    };

    const handleNewMessage = (data: {
      roomId: string;
      message: ChatMessage;
    }) => {
      if (roomId && data.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
        onMessageRef.current?.(data.message);
      }
    };

    const handleJoinedRoom = (data: {
      roomId: string;
      publicCode: string;
      room: Room;
    }) => {
      const acceptJoin = (confirmedRoomId: string) => {
        joinedRoomRef.current = confirmedRoomId;
        joiningRoomRef.current = null;
        setIsJoinedToRoom(true);
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
          joinTimeoutRef.current = null;
        }
        setIsMuted(data.room.isMuted || false);
        const pending = pendingMessagesRef.current.splice(0);
        for (const text of pending) {
          wsSendMessage(confirmedRoomId, text);
        }
      };

      if (roomId && data.roomId === roomId) {
        acceptJoin(data.roomId);
      } else if (
        roomId &&
        (joiningRoomRef.current === roomId || !joinedRoomRef.current)
      ) {
        acceptJoin(data.roomId);
      }
    };

    const handleRoomUpdate = (data: {
      roomId: string;
      room?: Room;
      event?: string;
      userId?: string;
    }) => {
      if (roomId && data.roomId === roomId) {
        setIsMuted(data.room?.isMuted || false);
        if (data.room) {
          onRoomUpdateRef.current?.({
            ...data,
            room: data.room,
          });
        }
      }
    };

    const handleError = (error: {
      message?: string;
      code: string;
      event?: string;
    }) => {
      if (error.event === "joinRoom") {
        joiningRoomRef.current = null;
      }
      if (error.event === "sendMessage" || error.event === "joinRoom") {
        onErrorRef.current?.(new Error(error.message));
      }
    };

    const unsubscribeChatHistory = on("chatHistory", handleChatHistory);
    const unsubscribeNewMessage = on("newMessage", handleNewMessage);
    const unsubscribeJoinedRoom = on("joinedRoom", handleJoinedRoom);
    const unsubscribeRoomUpdate = on("roomUpdate", handleRoomUpdate);
    const unsubscribeError = on("error", handleError);

    const shouldJoin =
      enabled &&
      isConnected &&
      publicCode &&
      userId &&
      roomId &&
      joinedRoomRef.current !== roomId &&
      joiningRoomRef.current !== roomId;

    if (shouldJoin) {
      const currentRoomId = getCurrentRoomId();
      if (currentRoomId === roomId) {
        joinedRoomRef.current = roomId;
        joiningRoomRef.current = null;
        setIsJoinedToRoom(true);
      } else {
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
        }

        joiningRoomRef.current = roomId;
        joinRoom(publicCode, userId, roomId);

        joinTimeoutRef.current = setTimeout(() => {
          if (
            joiningRoomRef.current === roomId &&
            joinedRoomRef.current !== roomId
          ) {
            joiningRoomRef.current = null;
            joinTimeoutRef.current = null;
            pendingMessagesRef.current = [];
            onErrorRef.current?.(
              new Error(
                "Не удалось присоединиться к комнате. Пожалуйста, попробуйте еще раз.",
              ),
            );
          }
        }, 10000);
      }
    }

    return () => {
      unsubscribeChatHistory();
      unsubscribeNewMessage();
      unsubscribeJoinedRoom();
      unsubscribeRoomUpdate();
      unsubscribeError();
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
    wsSendMessage,
  ]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!roomId) {
        onErrorRef.current?.(new Error("roomId не указан"));
        return;
      }

      const isPublicCode = /^\d{6}$/.test(roomId);
      if (isPublicCode) {
        onErrorRef.current?.(
          new Error(
            "Ошибка: передан код комнаты вместо ID. Пожалуйста, обновите страницу.",
          ),
        );
        return;
      }

      if (!isConnected) {
        onErrorRef.current?.(
          new Error(
            "WebSocket не подключен. Пожалуйста, подождите подключения.",
          ),
        );
        return;
      }

      if (!joinedRoomRef.current && joiningRoomRef.current !== roomId) {
        onErrorRef.current?.(
          new Error(
            "Вы еще не присоединились к этой комнате. Пожалуйста, подождите.",
          ),
        );
        return;
      }

      if (!joinedRoomRef.current && joiningRoomRef.current === roomId) {
        const currentRoomId = getCurrentRoomId();
        if (currentRoomId) {
          joinedRoomRef.current = currentRoomId;
          joiningRoomRef.current = null;
          setIsJoinedToRoom(true);
        } else {
          pendingMessagesRef.current.push(message);
          return;
        }
      }

      if (isMuted) {
        onErrorRef.current?.(
          new Error("Вы не можете отправлять сообщения (заглушены)"),
        );
        return;
      }

      const actualRoomId = joinedRoomRef.current || roomId;
      wsSendMessage(actualRoomId, message);
    },
    [roomId, isMuted, isConnected, wsSendMessage, getCurrentRoomId],
  );

  return {
    messages,
    isConnected,
    isMuted,
    isReadyToSend: isJoinedToRoom,
    sendMessage,
  };
}
