"use client";

import { type WebSocketServiceEvents, webSocketService } from "@mm-preview/sdk";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  // Fetches the HttpOnly access_token via a server-side route and connects.
  // Needed because the WS server is on a different domain (onrender.com)
  // and the browser won't send moviematch.space cookies cross-domain.
  const connectWithToken = useCallback(() => {
    fetch("/api/auth/token", { credentials: "include" })
      .then((res) => res.json())
      .then(({ accessToken }: { accessToken: string | null }) => {
        webSocketService.connect(accessToken ?? undefined);
      })
      .catch(() => webSocketService.connect());
  }, []);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const unsubscribeConnect = webSocketService.on("connect", handleConnect);
    const unsubscribeDisconnect = webSocketService.on(
      "disconnect",
      handleDisconnect,
    );

    setIsConnected(webSocketService.isConnected());

    if (autoConnect && !isInitialized.current) {
      isInitialized.current = true;
      connectWithToken();
    }

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, [autoConnect]);

  useEffect(() => {
    const handleError = (error: { code: string; message?: string }) => {
      if (error.code === "UNAUTHORIZED") {
        // Access token expired or missing — try refreshing via HTTP then reconnect.
        fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" })
          .then((res) => {
            if (!res.ok) throw new Error("refresh failed");
            return res.json();
          })
          .then(() => connectWithToken())
          .catch(() => {
            // Both tokens expired — redirect to login.
            const userCreationUrl = getAppUrls().USER_CREATION;
            if (typeof window !== "undefined") {
              window.location.href = userCreationUrl;
            }
          });
      }
    };

    const unsubscribe = webSocketService.on("error", handleError);
    return () => unsubscribe();
  }, []);

  const getMyRooms = useCallback(() => webSocketService.getMyRooms(), []);
  const joinRoom = useCallback(
    (publicCode: string, userId: string) =>
      webSocketService.joinRoom(publicCode, userId),
    [],
  );
  const leaveRoom = useCallback(
    (roomId: string, userId: string) =>
      webSocketService.leaveRoom(roomId, userId),
    [],
  );
  const sendMessage = useCallback(
    (roomId: string, message: string) =>
      webSocketService.sendMessage(roomId, message),
    [],
  );
  const reconnectToRoom = useCallback(
    (roomId: string, publicCode: string, userId: string) =>
      webSocketService.reconnectToRoom(roomId, publicCode, userId),
    [],
  );
  const getCurrentRoomId = useCallback(
    () => webSocketService.getCurrentRoomId(),
    [],
  );
  const refreshTokenAndReconnect = useCallback(
    () => webSocketService.refreshTokenAndReconnect(),
    [],
  );
  const on = useCallback(
    <T extends keyof WebSocketServiceEvents>(
      event: T,
      listener: WebSocketServiceEvents[T],
    ) => webSocketService.on(event, listener),
    [],
  );
  const off = useCallback(
    <T extends keyof WebSocketServiceEvents>(
      event: T,
      listener: WebSocketServiceEvents[T],
    ) => webSocketService.off(event, listener),
    [],
  );

  const value = useMemo<WebSocketContextValue>(
    () => ({
      isConnected,
      getMyRooms,
      joinRoom,
      leaveRoom,
      sendMessage,
      reconnectToRoom,
      getCurrentRoomId,
      refreshTokenAndReconnect,
      on,
      off,
    }),
    [
      isConnected,
      getMyRooms,
      joinRoom,
      leaveRoom,
      sendMessage,
      reconnectToRoom,
      getCurrentRoomId,
      refreshTokenAndReconnect,
      on,
      off,
    ],
  );

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
