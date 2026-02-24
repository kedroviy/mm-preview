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
  } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isJoinedToRoom, setIsJoinedToRoom] = useState(false);
  const joinedRoomRef = useRef<string | null>(null);
  const previousRoomIdRef = useRef<string | undefined>(undefined);
  const joiningRoomRef = useRef<string | null>(null);
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessagesRef = useRef<string[]>([]);

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
      console.log("🎉 Событие joinedRoom получено:", {
        eventRoomId: data.roomId,
        expectedRoomId: roomId,
        match: roomId && data.roomId === roomId,
        currentJoinedRoom: joinedRoomRef.current,
        currentJoiningRoom: joiningRoomRef.current,
      });

      // Если roomId из пропсов совпадает с roomId из события
      if (roomId && data.roomId === roomId) {
        console.log("✅ Присоединение к комнате подтверждено:", roomId);
        joinedRoomRef.current = data.roomId;
        joiningRoomRef.current = null;
        setIsJoinedToRoom(true);
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
          joinTimeoutRef.current = null;
        }
        setIsMuted(data.room.isMuted || false);
        const pending = pendingMessagesRef.current.splice(0);
        for (const text of pending) {
          wsSendMessage(data.roomId, text);
        }
        if (pending.length > 0) {
          console.log("📤 Отправлено отложенных сообщений:", pending.length);
        }
        if (data.room.muteExpiresAt && data.room.isMuted) {
          const minutesLeft = Math.ceil(
            (data.room.muteExpiresAt - Date.now()) / (60 * 1000),
          );
          console.warn(`⚠️ Вы заглушены на ${minutesLeft} минут(ы)`);
        }
      } else if (roomId) {
        // Если roomId не совпадает, но мы присоединяемся к этой комнате
        // Возможно, сервер вернул другой формат UUID или произошла ошибка
        console.warn("⚠️ Несоответствие roomId:", {
          expected: roomId,
          received: data.roomId,
          publicCode: data.publicCode,
        });

        // Если мы присоединяемся к этой комнате (по publicCode), но roomId не совпадает,
        // все равно считаем, что присоединились (возможно, сервер вернул другой UUID)
        if (joiningRoomRef.current === roomId || !joinedRoomRef.current) {
          console.log(
            "⚠️ Принимаем присоединение, несмотря на несоответствие roomId",
          );
          joinedRoomRef.current = data.roomId;
          joiningRoomRef.current = null;
          setIsJoinedToRoom(true);
          if (joinTimeoutRef.current) {
            clearTimeout(joinTimeoutRef.current);
            joinTimeoutRef.current = null;
          }
          setIsMuted(data.room.isMuted || false);
          const pending = pendingMessagesRef.current.splice(0);
          for (const text of pending) {
            wsSendMessage(data.roomId, text);
          }
        }
      } else {
        // Если roomId не указан в пропсах, но событие пришло
        console.log(
          "ℹ️ Событие joinedRoom получено, но roomId не указан в пропсах",
        );
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
      // Проверяем, может быть мы уже присоединены к этой комнате через WebSocket сервис
      const currentRoomId = getCurrentRoomId();
      if (currentRoomId === roomId) {
        console.log(
          "✅ Уже присоединены к комнате через WebSocket сервис, обновляем состояние",
        );
        joinedRoomRef.current = roomId;
        joiningRoomRef.current = null;
        setIsJoinedToRoom(true);
      } else {
        // Очищаем предыдущий таймаут, если он есть
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current);
        }

        console.log("🚪 Присоединение к комнате:", {
          roomId,
          publicCode,
          userId,
          currentRoomId,
        });

        joiningRoomRef.current = roomId; // Устанавливаем флаг присоединения
        joinRoom(publicCode, userId);

        // Таймаут для присоединения (10 секунд)
        // Если присоединение не завершилось за это время, сбрасываем флаг
        joinTimeoutRef.current = setTimeout(() => {
          if (
            joiningRoomRef.current === roomId &&
            joinedRoomRef.current !== roomId
          ) {
            console.warn("⚠️ Таймаут присоединения к комнате:", roomId);
            joiningRoomRef.current = null;
            joinTimeoutRef.current = null;
            pendingMessagesRef.current = [];
            onError?.(
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
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          roomId,
        );
      const isPublicCode = /^\d{6}$/.test(roomId);

      if (isPublicCode) {
        console.error(
          "❌ ОШИБКА: В sendMessage передан publicCode вместо roomId:",
          roomId,
        );
        onError?.(
          new Error(
            "Ошибка: передан код комнаты вместо ID. Пожалуйста, обновите страницу.",
          ),
        );
        return;
      }

      if (!isUUID) {
        console.warn("⚠️ roomId не похож на UUID:", roomId);
      }

      if (!isConnected) {
        onError?.(
          new Error(
            "WebSocket не подключен. Пожалуйста, подождите подключения.",
          ),
        );
        return;
      }

      // Проверяем, присоединились ли мы к комнате или присоединяемся
      if (
        joinedRoomRef.current !== roomId &&
        joiningRoomRef.current !== roomId
      ) {
        onError?.(
          new Error(
            "Вы еще не присоединились к этой комнате. Пожалуйста, подождите.",
          ),
        );
        return;
      }

      // Если мы еще присоединяемся, ставим сообщение в очередь или проверяем getCurrentRoomId
      const currentRoomId = getCurrentRoomId();
      if (
        joiningRoomRef.current === roomId &&
        joinedRoomRef.current !== roomId
      ) {
        if (currentRoomId === roomId) {
          console.log(
            "✅ Обнаружено присоединение через getCurrentRoomId, обновляем состояние",
          );
          joinedRoomRef.current = roomId;
          joiningRoomRef.current = null;
          setIsJoinedToRoom(true);
        } else {
          pendingMessagesRef.current.push(message);
          return;
        }
      }

      if (isMuted) {
        onError?.(new Error("Вы не можете отправлять сообщения (заглушены)"));
        return;
      }

      console.log("💬 Отправка сообщения:", {
        roomId,
        isUUID,
        joinedRoom: joinedRoomRef.current,
        joiningRoom: joiningRoomRef.current,
        currentRoomId: getCurrentRoomId(),
      });
      wsSendMessage(roomId, message);
    },
    [roomId, isMuted, isConnected, wsSendMessage, onError, getCurrentRoomId],
  );

  return {
    messages,
    isConnected,
    isMuted,
    isReadyToSend: isJoinedToRoom,
    sendMessage,
  };
}
