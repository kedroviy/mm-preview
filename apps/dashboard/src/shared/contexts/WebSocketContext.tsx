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
import { isMovieMatchLegacy, movieMatchWebSocketService } from "../movie-match";

const MAX_AUTH_RETRIES = 2;

function getRoomWs() {
  return isMovieMatchLegacy() ? movieMatchWebSocketService : webSocketService;
}

interface WebSocketContextValue {
  isConnected: boolean;
  getMyRooms: () => void;
  joinRoom: (publicCode: string, userId: string, clientRoomId?: string) => void;
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
  const authRetryCount = useRef(0);
  const isRetrying = useRef(false);

  const connectWithToken = useCallback(() => {
    fetch("/api/auth/token", { credentials: "include" })
      .then((res) => res.json())
      .then(({ accessToken }: { accessToken: string | null }) => {
        getRoomWs().connect(accessToken ?? undefined);
      })
      .catch(() => getRoomWs().connect());
  }, []);

  const redirectToLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = getAppUrls().USER_CREATION;
    }
  }, []);

  useEffect(() => {
    const ws = getRoomWs();
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const resetAuthRetries = () => {
      authRetryCount.current = 0;
      isRetrying.current = false;
    };

    const unsubscribeConnect = ws.on("connect", handleConnect);
    const unsubscribeDisconnect = ws.on("disconnect", handleDisconnect);
    const unsubJoinedRoom = ws.on("joinedRoom", resetAuthRetries);
    const unsubMyRooms = ws.on("myRooms", resetAuthRetries);
    const unsubTokenRefreshed = ws.on("tokenRefreshed", resetAuthRetries);

    setIsConnected(ws.isConnected());

    if (autoConnect && !isInitialized.current) {
      isInitialized.current = true;
      connectWithToken();
    }

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubJoinedRoom();
      unsubMyRooms();
      unsubTokenRefreshed();
    };
  }, [autoConnect, connectWithToken]);

  useEffect(() => {
    if (isMovieMatchLegacy()) {
      return;
    }

    const handleError = (error: { code: string; message?: string }) => {
      if (error.code !== "UNAUTHORIZED") return;
      if (isRetrying.current) return;

      authRetryCount.current++;

      if (authRetryCount.current > MAX_AUTH_RETRIES) {
        redirectToLogin();
        return;
      }

      isRetrying.current = true;
      fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("refresh failed");
          return res.json();
        })
        .then((data: { accessToken?: string } | undefined) => {
          isRetrying.current = false;

          if (data?.accessToken) {
            webSocketService.disconnect();
            webSocketService.connect(data.accessToken);
          } else {
            redirectToLogin();
          }
        })
        .catch(() => {
          isRetrying.current = false;
          redirectToLogin();
        });
    };

    const unsubscribe = webSocketService.on("error", handleError);
    return () => unsubscribe();
  }, [redirectToLogin]);

  const getMyRooms = useCallback(() => getRoomWs().getMyRooms(), []);
  const joinRoom = useCallback(
    (publicCode: string, userId: string, clientRoomId?: string) =>
      getRoomWs().joinRoom(publicCode, userId, clientRoomId),
    [],
  );
  const leaveRoom = useCallback(
    (roomId: string, userId: string) => getRoomWs().leaveRoom(roomId, userId),
    [],
  );
  const sendMessage = useCallback(
    (roomId: string, message: string) =>
      getRoomWs().sendMessage(roomId, message),
    [],
  );
  const reconnectToRoom = useCallback(
    (roomId: string, publicCode: string, userId: string) =>
      getRoomWs().reconnectToRoom(roomId, publicCode, userId),
    [],
  );
  const getCurrentRoomId = useCallback(
    () => getRoomWs().getCurrentRoomId(),
    [],
  );
  const refreshTokenAndReconnect = useCallback(
    () => getRoomWs().refreshTokenAndReconnect(),
    [],
  );
  const on = useCallback(
    <T extends keyof WebSocketServiceEvents>(
      event: T,
      listener: WebSocketServiceEvents[T],
    ) => getRoomWs().on(event, listener),
    [],
  );
  const off = useCallback(
    <T extends keyof WebSocketServiceEvents>(
      event: T,
      listener: WebSocketServiceEvents[T],
    ) => getRoomWs().off(event, listener),
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
