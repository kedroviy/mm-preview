"use client";

import { io, type Socket } from "socket.io-client";
import { getWebSocketRoomsUrl } from "../utils/api-url";
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

export interface WebSocketErrorPayload {
  message: string;
  code: string;
  event?: string;
}

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

export class WebSocketService {
  private socket: Socket | null = null;
  private listeners = new Map<
    keyof WebSocketServiceEvents,
    Set<EventListener<any>>
  >();
  private currentRoomId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private shouldStopReconnecting = false;

  connect(token?: string): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.shouldStopReconnecting = false;
    this.reconnectAttempts = 0;
    this.isConnecting = true;

    const roomsUrl = getWebSocketRoomsUrl();

    try {
      this.socket = io(roomsUrl, {
        transports: ["websocket"],
        reconnection: false,
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
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnecting = false;
      this.emit("disconnect", reason);
      if (this.shouldStopReconnecting) {
        this.cleanupSocket();
      }
    });

    this.socket.on("connect_error", (err: Error) => {
      this.isConnecting = false;
      this.reconnectAttempts++;
      const msg = err?.message ?? "";
      if (msg.includes("Authentication required") || msg.includes("UNAUTHORIZED")) {
        this.cleanupSocket();
        this.emit("error", { message: msg, code: "UNAUTHORIZED" });
        return;
      }

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * this.reconnectAttempts, 5000);
        setTimeout(() => this.connect(), delay);
      } else {
        this.cleanupSocket();
        this.emit("error", {
          message: `Не удалось подключиться после ${this.maxReconnectAttempts} попыток`,
          code: "INTERNAL_ERROR",
        });
      }
    });

    this.socket.on(SERVER_EVENTS.TOKEN_REFRESHED, (data: TokenRefreshedMessage) => {
      this.shouldStopReconnecting = false;
      this.emit("tokenRefreshed", data);
    });

    this.socket.on(SERVER_EVENTS.ERROR, (error: ErrorMessage) => {
      if (error.code === "UNAUTHORIZED") this.cleanupSocket();
      this.emit("error", error);
    });

    // Регистрация остальных серверных событий
    this.socket.on(SERVER_EVENTS.MY_ROOMS, (data: MyRoomsMessage) => this.emit("myRooms", data));
    this.socket.on(SERVER_EVENTS.JOINED_ROOM, (data: JoinedRoomMessage) => {
      this.currentRoomId = data.roomId;
      this.emit("joinedRoom", data);
    });
    this.socket.on(SERVER_EVENTS.LEFT_ROOM, (data: LeftRoomMessage) => {
      if (this.currentRoomId === data.roomId) this.currentRoomId = null;
      this.emit("leftRoom", data);
    });
    this.socket.on(SERVER_EVENTS.CHAT_HISTORY, (data: ChatHistoryMessage) => this.emit("chatHistory", data));
    this.socket.on(SERVER_EVENTS.NEW_MESSAGE, (data: NewMessageMessage) => this.emit("newMessage", data));
    this.socket.on(SERVER_EVENTS.ROOM_UPDATE, (data: RoomUpdateMessage) => this.emit("roomUpdate", data));
    this.socket.on(SERVER_EVENTS.ROOM_CREATED, (data: RoomCreatedMessage) => this.emit("roomCreated", data));
    this.socket.on(SERVER_EVENTS.ROOM_DATA, (data: RoomDataMessage) => this.emit("roomData", data));
  }

  // --- НОВЫЕ МЕТОДЫ ---

  sendMessage(roomId: string, message: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(CLIENT_EVENTS.SEND_MESSAGE, { roomId, message });
  }

  leaveRoom(roomId: string, userId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomId, userId });
  }

  reconnectToRoom(_roomId: string, publicCode: string, userId: string): void {
    this.joinRoom(publicCode, userId);
  }

  /**
   * Принудительное обновление и переподключение (используется провайдером)
   */
  async refreshTokenAndReconnect(): Promise<void> {
    this.cleanupSocket();
    this.connect();
  }

  // --- СЛУЖЕБНЫЕ МЕТОДЫ ---

  private cleanupSocket(): void {
    const s = this.socket;
    this.socket = null;
    this.currentRoomId = null;
    if (s) {
      s.removeAllListeners();
      s.disconnect();
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

  on<T extends keyof WebSocketServiceEvents>(event: T, listener: EventListener<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(listener as EventListener<any>);
    return () => this.off(event, listener);
  }

  off<T extends keyof WebSocketServiceEvents>(event: T, listener?: EventListener<T>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    if (listener) set.delete(listener as EventListener<any>);
    else set.clear();
  }

  private emit<T extends keyof WebSocketServiceEvents>(event: T, ...args: Parameters<WebSocketServiceEvents[T]>): void {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        (fn as (...a: any[]) => void)(...args);
      } catch (e) {
        console.error(`WebSocketService handler error [${event}]:`, e);
      }
    });
  }

  getMyRooms(): void {
    if (this.socket?.connected) {
      this.socket.emit(CLIENT_EVENTS.GET_MY_ROOMS);
    }
  }

  joinRoom(publicCode: string, userId: string): void {
    if (!this.socket?.connected) {
      if (!this.isConnecting) this.connect();
      let attempts = 0;
      const tryJoin = () => {
        attempts++;
        if (this.socket?.connected) {
          this.socket.emit(CLIENT_EVENTS.JOIN_ROOM, { publicCode, userId });
        } else if (attempts < 50) {
          setTimeout(tryJoin, 100);
        }
      };
      tryJoin();
      return;
    }
    this.socket.emit(CLIENT_EVENTS.JOIN_ROOM, { publicCode, userId });
  }
}

export const webSocketService = new WebSocketService();
