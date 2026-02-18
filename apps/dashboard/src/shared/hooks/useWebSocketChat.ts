"use client";

import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import type { ChatMessage, Room } from "@mm-preview/sdk";

interface UseWebSocketChatOptions {
  roomId?: string;
  publicCode?: string;
  userId: string;
  enabled?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onHistory?: (messages: ChatMessage[]) => void;
  onRoomUpdate?: (data: { roomId: string; room: Room; event: string; userId?: string }) => void;
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
  const { isConnected, joinRoom, sendMessage: wsSendMessage, on, off } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Подписываемся на события чата
  useEffect(() => {
    if (!enabled || !userId) return;

    const handleChatHistory = (data: { roomId: string; messages: ChatMessage[] }) => {
      if (roomId && data.roomId === roomId) {
        setMessages(data.messages);
        onHistory?.(data.messages);
      }
    };

    const handleNewMessage = (data: { roomId: string; message: ChatMessage }) => {
      if (roomId && data.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
        onMessage?.(data.message);
      }
    };

    const handleJoinedRoom = (data: { roomId: string; publicCode: string; room: Room }) => {
      if (roomId && data.roomId === roomId) {
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

    const handleError = (error: { message: string; code: string; event?: string }) => {
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

    // Присоединяемся к комнате если подключены и есть publicCode
    if (enabled && isConnected && publicCode && userId) {
      joinRoom(publicCode, userId);
    }

    return () => {
      unsubscribeChatHistory();
      unsubscribeNewMessage();
      unsubscribeJoinedRoom();
      unsubscribeRoomUpdate();
      unsubscribeError();
    };
  }, [enabled, userId, roomId, publicCode, isConnected, joinRoom, on, off, onMessage, onHistory, onRoomUpdate, onError]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!roomId) {
        onError?.(new Error("roomId не указан"));
        return;
      }

      if (isMuted) {
        onError?.(new Error("Вы не можете отправлять сообщения (заглушены)"));
        return;
      }

      wsSendMessage(roomId, message);
    },
    [roomId, isMuted, wsSendMessage, onError],
  );

  return {
    messages,
    isConnected,
    isMuted,
    sendMessage,
  };
}
