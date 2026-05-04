"use client";

import type { Room, WebSocketServiceEvents } from "@mm-preview/sdk";
import { ROOM_UPDATE_EVENTS } from "@mm-preview/sdk";
import { io, type Socket } from "socket.io-client";
import { getMovieMatchBaseUrl } from "./config";

type EventListener<T extends keyof WebSocketServiceEvents> =
  WebSocketServiceEvents[T];

/**
 * Socket.IO к legacy movieMatcher: namespace `/rooms`, события `joinRoom`, `matchUpdated`, …
 */
export class MovieMatchWebSocketService {
  private socket: Socket | null = null;
  private listeners = new Map<
    keyof WebSocketServiceEvents,
    Set<EventListener<any>>
  >();
  private currentRoomId: string | null = null;
  private isConnecting = false;

  private emit<T extends keyof WebSocketServiceEvents>(
    event: T,
    ...args: Parameters<WebSocketServiceEvents[T]>
  ): void {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        (fn as (...a: unknown[]) => void)(...args);
      } catch (e) {
        console.error(`[MovieMatch WS] handler error [${String(event)}]:`, e);
      }
    });
  }

  on<T extends keyof WebSocketServiceEvents>(
    event: T,
    listener: EventListener<T>,
  ): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(listener as EventListener<any>);
    return () => this.off(event, listener);
  }

  off<T extends keyof WebSocketServiceEvents>(
    event: T,
    listener?: EventListener<T>,
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    if (listener) set.delete(listener as EventListener<any>);
    else set.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  connect(_token?: string): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    const url = `${getMovieMatchBaseUrl()}/rooms`;

    this.socket = io(url, {
      reconnection: true,
      transports: ["polling", "websocket"],
      upgrade: true,
    });

    this.socket.on("connect", () => {
      this.isConnecting = false;
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnecting = false;
      this.emit("disconnect", reason);
    });

    this.socket.on("connect_error", (err: Error) => {
      this.isConnecting = false;
      this.emit("error", {
        message: err?.message ?? "connect_error",
        code: "INTERNAL_ERROR",
      });
    });

    this.socket.on("matchUpdated", (data: unknown) => {
      let roomId = this.currentRoomId;
      if (!roomId && data && typeof data === "object" && "roomId" in data) {
        roomId = String((data as { roomId: unknown }).roomId);
      }
      if (roomId) {
        this.emit("roomUpdate", {
          roomId,
          event: ROOM_UPDATE_EVENTS.USER_CONNECTED,
        });
      }
    });
  }

  disconnect(): void {
    const s = this.socket;
    this.socket = null;
    this.currentRoomId = null;
    this.isConnecting = false;
    if (s) {
      s.removeAllListeners();
      s.disconnect();
    }
  }

  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  getMyRooms(): void {
    /* В RN список комнат берётся через REST `/rooms/my/memberships`. */
  }

  joinRoom(publicCode: string, userId: string, clientRoomId?: string): void {
    if (!this.socket?.connected) {
      if (!this.isConnecting) this.connect();
      let attempts = 0;
      const tryJoin = () => {
        attempts++;
        if (this.socket?.connected) {
          this.runJoin(publicCode, userId, clientRoomId);
        } else if (attempts < 80) {
          setTimeout(tryJoin, 100);
        }
      };
      tryJoin();
      return;
    }
    this.runJoin(publicCode, userId, clientRoomId);
  }

  private runJoin(
    publicCode: string,
    userId: string,
    clientRoomId?: string,
  ): void {
    if (!this.socket?.connected) return;
    const roomKey = publicCode;
    if (clientRoomId) {
      this.currentRoomId = clientRoomId;
    }
    this.socket.emit("joinRoom", { roomKey, userId });

    const rid = clientRoomId ?? this.currentRoomId ?? publicCode;
    const syntheticRoom: Room = {
      roomId: rid,
      publicCode,
      createdBy: null,
      users: [],
      userRoles: {},
      choices: {},
      isMember: true,
      isCreator: false,
      canManage: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTimeout(() => {
      this.emit("joinedRoom", {
        roomId: rid,
        publicCode,
        room: syntheticRoom,
      });
    }, 0);
  }

  leaveRoom(_roomId: string, _userId: string): void {
    /* Выход из комнаты в legacy — через REST `/rooms/my/leave`. */
  }

  sendMessage(_roomId: string, _message: string): void {
    /* В movieMatcher чат идёт другими событиями; отправка сообщений нового API не используется. */
  }

  reconnectToRoom(roomId: string, publicCode: string, userId: string): void {
    this.joinRoom(publicCode, userId, roomId);
  }

  async refreshTokenAndReconnect(): Promise<void> {
    this.disconnect();
    this.connect();
  }
}

export const movieMatchWebSocketService = new MovieMatchWebSocketService();
