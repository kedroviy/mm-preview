"use client";

import { type WebSocketServiceEvents, webSocketService } from "@mm-preview/sdk";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getAppUrls } from "../config/constants";

interface WebSocketContextValue {
  isConnected: boolean;
  getMyRooms: () => void;
  joinRoom: (publicCode: string, userId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  sendMessage: (roomId: string, message: string) => void;
  reconnectToRoom: (roomId: string, publicCode: string, userId: string) => void;
  getCurrentRoomId: () => string | null;
  refreshTokenAndReconnect: () => Promise<void>;
  on: <T extends keyof WebSocketServiceEvents>(
    event: T,
    listener: WebSocketServiceEvents[T],
  ) => () => void;
  off: <T extends keyof WebSocketServiceEvents>(
    event: T,
    listener: WebSocketServiceEvents[T],
  ) => void;
}

const WEB_SOCKET_CONTEXT = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({
  children,
  autoConnect = true,
}: PropsWithChildren<{ autoConnect?: boolean }>) {
  const isInitialized = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (autoConnect && !isInitialized.current) {
      webSocketService.connect();
      isInitialized.current = true;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const unsubscribeConnect = webSocketService.on("connect", handleConnect);
    const unsubscribeDisconnect = webSocketService.on(
      "disconnect",
      handleDisconnect,
    );

    setIsConnected(webSocketService.isConnected());

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, [autoConnect]);

  useEffect(() => {
    const handleError = (error: { code: string }) => {
      if (error.code === "UNAUTHORIZED" && typeof window !== "undefined") {
        const userCreationUrl = getAppUrls().USER_CREATION;
        window.location.href = userCreationUrl;
      }
    };

    const unsubscribe = webSocketService.on("error", handleError);
    return () => unsubscribe();
  }, []);

  const value: WebSocketContextValue = {
    isConnected,
    getMyRooms: () => webSocketService.getMyRooms(),
    joinRoom: (publicCode, userId) =>
      webSocketService.joinRoom(publicCode, userId),
    leaveRoom: (roomId, userId) => webSocketService.leaveRoom(roomId, userId),
    sendMessage: (roomId, message) =>
      webSocketService.sendMessage(roomId, message),
    reconnectToRoom: (roomId, publicCode, userId) =>
      webSocketService.reconnectToRoom(roomId, publicCode, userId),
    getCurrentRoomId: () => webSocketService.getCurrentRoomId(),
    refreshTokenAndReconnect: () => webSocketService.refreshTokenAndReconnect(),
    on: (event, listener) => webSocketService.on(event, listener),
    off: (event, listener) => webSocketService.off(event, listener),
  };

  return (
    <WEB_SOCKET_CONTEXT.Provider value={value}>
      {children}
    </WEB_SOCKET_CONTEXT.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WEB_SOCKET_CONTEXT);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
