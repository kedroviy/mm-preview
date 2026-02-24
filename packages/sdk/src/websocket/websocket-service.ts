"use client";

import { io, type Socket } from "socket.io-client";
import { getWebSocketRoomsUrl } from "../utils/api-url";
import {
  getAccessToken,
  removeAllAuthTokens,
  setAccessToken,
} from "../utils/cookies";
import { CLIENT_EVENTS, SERVER_EVENTS } from "./constants/events";
import type {
  ChatHistoryMessage,
  ErrorMessage,
  JoinedRoomMessage,
  LeftRoomMessage,
  MyRoomsMessage,
  NewMessageMessage,
  RoomCreatedMessage,
  RoomDataMessage,
  RoomUpdateMessage,
  TokenRefreshedMessage,
} from "./types/messages";

/** Пайлоад ошибки: от сервера (WsError) или внутренней */
export interface WebSocketErrorPayload {
  message: string;
  code: string;
  event?: string;
}

/** События, которые сервис эмитит подписчикам (совпадают с SERVER_EVENTS + connect/disconnect) */
export interface WebSocketServiceEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  error: (error: WebSocketErrorPayload) => void;
  tokenRefreshed: (data: TokenRefreshedMessage) => void;
  roomCreated: (data: RoomCreatedMessage) => void;
  joinedRoom: (data: JoinedRoomMessage) => void;
  leftRoom: (data: LeftRoomMessage) => void;
  roomUpdate: (data: RoomUpdateMessage) => void;
  roomData: (data: RoomDataMessage) => void;
  myRooms: (data: MyRoomsMessage) => void;
  chatHistory: (data: ChatHistoryMessage) => void;
  newMessage: (data: NewMessageMessage) => void;
}

type EventListener<T extends keyof WebSocketServiceEvents> =
  WebSocketServiceEvents[T];

/**
 * Сервис WebSocket для namespace /rooms.
 * Соответствует руководству бэкенда: Socket.IO, namespace /rooms, CLIENT_EVENTS / SERVER_EVENTS.
 */
export class WebSocketService {
  private socket: Socket | null = null;
  private listeners = new Map<
    keyof WebSocketServiceEvents,
    Set<EventListener<any>>
  >();
  private currentRoomId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private authErrorCount = 0;
  private maxAuthErrors = 3;
  private isConnecting = false;
  private shouldStopReconnecting = false;

  /**
   * Подключение к WebSocket namespace /rooms
   */
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const token = getAccessToken();
    const roomsUrl = getWebSocketRoomsUrl();

    if (this.shouldStopReconnecting) {
      this.isConnecting = false;
      return;
    }

    try {
      this.socket = io(roomsUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
        ...(token ? { auth: { token } } : {}),
      });

      this.setupEventHandlers();

      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        this.socket.onAny((event, ...args) => {
          console.log("[WS] ←", event, args);
        });
        this.socket.onAnyOutgoing((event, ...args) => {
          console.log("[WS] →", event, args);
        });
      }
    } catch (_err) {
      this.isConnecting = false;
      this.emit("error", {
        message: "Ошибка создания соединения",
        code: "BAD_REQUEST",
      });
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      if (!this.shouldStopReconnecting) {
        this.authErrorCount = 0;
      }
      this.isConnecting = false;
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnecting = false;
      this.emit("disconnect", reason);

      if (this.shouldStopReconnecting) {
        this.cleanupSocket();
        return;
      }
    });

    this.socket.on("connect_error", (err: Error) => {
      this.isConnecting = false;
      this.reconnectAttempts++;

      const msg = err?.message ?? "";
      if (
        msg.includes("Authentication required") ||
        msg.includes("UNAUTHORIZED")
      ) {
        this.shouldStopReconnecting = true;
        this.authErrorCount = this.maxAuthErrors;
        this.cleanupSocket();
        removeAllAuthTokens();
        this.emit("error", { message: msg, code: "UNAUTHORIZED" });
        return;
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit("error", {
          message: `Не удалось подключиться после ${this.maxReconnectAttempts} попыток`,
          code: "INTERNAL_ERROR",
        });
      } else {
        this.emit("error", {
          message: msg || "Ошибка подключения",
          code: "BAD_REQUEST",
        });
      }
    });

    this.socket.on(
      SERVER_EVENTS.TOKEN_REFRESHED,
      (data: TokenRefreshedMessage) => {
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          this.authErrorCount = 0;
          this.shouldStopReconnecting = false;
        }
        this.emit("tokenRefreshed", data);
      },
    );

    this.socket.on(SERVER_EVENTS.ERROR, (error: ErrorMessage) => {
      if (error.code === "UNAUTHORIZED") {
        this.shouldStopReconnecting = true;
        this.authErrorCount = this.maxAuthErrors;
        this.cleanupSocket();
        removeAllAuthTokens();
      }
      this.emit("error", error);
    });

    this.socket.on(SERVER_EVENTS.MY_ROOMS, (data: MyRoomsMessage) => {
      this.emit("myRooms", data);
    });

    this.socket.on(SERVER_EVENTS.JOINED_ROOM, (data: JoinedRoomMessage) => {
      this.currentRoomId = data.roomId;
      this.emit("joinedRoom", data);
    });

    this.socket.on(SERVER_EVENTS.LEFT_ROOM, (data: LeftRoomMessage) => {
      if (this.currentRoomId === data.roomId) {
        this.currentRoomId = null;
      }
      this.emit("leftRoom", data);
    });

    this.socket.on(SERVER_EVENTS.CHAT_HISTORY, (data: ChatHistoryMessage) => {
      this.emit("chatHistory", data);
    });

    this.socket.on(SERVER_EVENTS.NEW_MESSAGE, (data: NewMessageMessage) => {
      this.emit("newMessage", data);
    });

    this.socket.on(SERVER_EVENTS.ROOM_UPDATE, (data: RoomUpdateMessage) => {
      this.emit("roomUpdate", data);
    });

    this.socket.on(SERVER_EVENTS.ROOM_CREATED, (data: RoomCreatedMessage) => {
      this.emit("roomCreated", data);
    });

    this.socket.on(SERVER_EVENTS.ROOM_DATA, (data: RoomDataMessage) => {
      this.emit("roomData", data);
    });
  }

  private cleanupSocket(): void {
    const s = this.socket;
    this.socket = null;
    this.currentRoomId = null;
    if (s) {
      try {
        s.removeAllListeners();
        s.disconnect();
      } catch {
        // ignore
      }
    }
  }

  disconnect(): void {
    this.cleanupSocket();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  on<T extends keyof WebSocketServiceEvents>(
    event: T,
    listener: EventListener<T>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener as EventListener<any>);
    return () => this.off(event, listener);
  }

  off<T extends keyof WebSocketServiceEvents>(
    event: T,
    listener?: EventListener<T>,
  ): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    if (listener) {
      set.delete(listener as EventListener<any>);
    } else {
      set.clear();
    }
  }

  private emit<T extends keyof WebSocketServiceEvents>(
    event: T,
    ...args: Parameters<WebSocketServiceEvents[T]>
  ): void {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        (fn as (...a: any[]) => void)(...args);
      } catch (e) {
        console.error(`WebSocketService handler error [${event}]:`, e);
      }
    });
  }

  getMyRooms(): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.GET_MY_ROOMS,
      });
      return;
    }
    this.socket.emit(CLIENT_EVENTS.GET_MY_ROOMS);
  }

  joinRoom(publicCode: string, userId: string): void {
    if (!this.socket?.connected) {
      if (!this.isConnecting) {
        this.connect();
      }
      let attempts = 0;
      const maxAttempts = 50;
      const tryJoin = () => {
        attempts++;
        if (this.socket?.connected) {
          this.socket.emit(CLIENT_EVENTS.JOIN_ROOM, { publicCode, userId });
        } else if (
          attempts >= maxAttempts ||
          (!this.isConnecting && !this.socket)
        ) {
          this.emit("error", {
            message: "WebSocket не подключен. Не удалось подключиться.",
            code: "BAD_REQUEST",
            event: CLIENT_EVENTS.JOIN_ROOM,
          });
        } else {
          setTimeout(tryJoin, 100);
        }
      };
      setTimeout(tryJoin, 100);
      return;
    }

    if (!publicCode || !userId) {
      this.emit("error", {
        message: "publicCode и userId обязательны",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.JOIN_ROOM,
      });
      return;
    }

    this.socket.emit(CLIENT_EVENTS.JOIN_ROOM, { publicCode, userId });
  }

  leaveRoom(roomId: string, userId: string): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.LEAVE_ROOM,
      });
      return;
    }
    if (!roomId || !userId) {
      this.emit("error", {
        message: "roomId и userId обязательны",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.LEAVE_ROOM,
      });
      return;
    }
    this.socket.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomId, userId });
  }

  chooseMovie(roomId: string, userId: string, movieId: string): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.CHOOSE_MOVIE,
      });
      return;
    }
    this.socket.emit(CLIENT_EVENTS.CHOOSE_MOVIE, { roomId, userId, movieId });
  }

  getRoom(roomId: string): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.GET_ROOM,
      });
      return;
    }
    this.socket.emit(CLIENT_EVENTS.GET_ROOM, { roomId });
  }

  createRoom(name?: string): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.CREATE_ROOM,
      });
      return;
    }
    this.socket.emit(CLIENT_EVENTS.CREATE_ROOM, { name });
  }

  /**
   * Отправка сообщения в чат. roomId должен быть UUID, а не publicCode.
   */
  sendMessage(roomId: string, message: string): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен. Пожалуйста, подождите подключения.",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.SEND_MESSAGE,
      });
      return;
    }

    const trimmed = message?.trim();
    if (!roomId || !trimmed) {
      this.emit("error", {
        message: "roomId и message обязательны",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.SEND_MESSAGE,
      });
      return;
    }

    if (trimmed.length > 1000) {
      this.emit("error", {
        message: "Сообщение слишком длинное (максимум 1000 символов)",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.SEND_MESSAGE,
      });
      return;
    }

    const _isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        roomId,
      );
    const isPublicCode = /^\d{6}$/.test(roomId);

    if (isPublicCode) {
      this.emit("error", {
        message:
          "Ошибка: передан код комнаты вместо ID. Пожалуйста, обновите страницу.",
        code: "BAD_REQUEST",
        event: CLIENT_EVENTS.SEND_MESSAGE,
      });
      return;
    }

    this.socket.emit(CLIENT_EVENTS.SEND_MESSAGE, { roomId, message: trimmed });
  }

  reconnectToRoom(_roomId: string, publicCode: string, userId: string): void {
    this.joinRoom(publicCode, userId);
  }

  /**
   * Обновить токен и переподключиться (для использования из приложения)
   */
  async refreshTokenAndReconnect(): Promise<void> {
    const { getRefreshToken } = await import("../utils/cookies");
    const { authApi } = await import("../services/auth");
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        const response = await authApi.refreshToken();
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
          this.disconnect();
          this.connect();
        }
      } else {
        this.disconnect();
        this.connect();
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        removeAllAuthTokens();
        this.emit("error", {
          message: "Требуется повторный вход",
          code: "UNAUTHORIZED",
        });
      } else {
        this.emit("error", {
          message: "Не удалось обновить токен",
          code: "INTERNAL_ERROR",
        });
      }
    }
  }
}

/** Singleton для использования в приложениях */
export const webSocketService = new WebSocketService();
