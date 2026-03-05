"use client";

import {
  setAccessToken,
  type WebSocketServiceEvents,
  webSocketService,
} from "@mm-preview/sdk";
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

const MAX_AUTH_RETRIES = 2;

interface WebSocketContextValue {
  isConnected: boolean;
  getMyRooms: () => void;
  joinRoom: (publicCode: string, userId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  sendMessage: (roomId: string, message: string) => void;
  reconnectToRoom: (
    roomId: string,
    publicCode: string,
    userId: string,
  ) => void;
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
        webSocketService.connect(accessToken ?? undefined);
      })
      .catch(() => webSocketService.connect());
  }, []);

  const redirectToLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = getAppUrls().USER_CREATION;
    }
  }, []);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const resetAuthRetries = () => {
      authRetryCount.current = 0;
      isRetrying.current = false;
    };

    const unsubscribeConnect = webSocketService.on("connect", handleConnect);
    const unsubscribeDisconnect = webSocketService.on(
      "disconnect",
      handleDisconnect,
    );
    const unsubJoinedRoom = webSocketService.on("joinedRoom", resetAuthRetries);
    const unsubMyRooms = webSocketService.on("myRooms", resetAuthRetries);
    const unsubTokenRefreshed = webSocketService.on(
      "tokenRefreshed",
      resetAuthRetries,
    );

    setIsConnected(webSocketService.isConnected());

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
    const handleError = (error: { code: string; message?: string }) => {
      if (error.code !== "UNAUTHORIZED") {
        return;
      }

      if (isRetrying.current) {
        return;
      }

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
          if (!res.ok) {
            throw new Error("refresh failed");
          }
          return res.json();
        })
        .then((data: { accessToken?: string } | undefined) => {
          isRetrying.current = false;
          if (data?.accessToken) {
            setAccessToken(data.accessToken);
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
  }, [connectWithToken, redirectToLogin]);

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
