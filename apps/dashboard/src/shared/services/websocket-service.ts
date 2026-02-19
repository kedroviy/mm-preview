"use client";

import type { ChatMessage, Room } from "@mm-preview/sdk";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@mm-preview/sdk";
import { io, type Socket } from "socket.io-client";

export interface WebSocketServiceEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  error: (error: { message: string; code: string; event?: string }) => void;
  tokenRefreshed: (data: { accessToken: string; message?: string }) => void;
  myRooms: (data: { rooms: Room[] }) => void;
  joinedRoom: (data: {
    roomId: string;
    publicCode: string;
    room: Room;
  }) => void;
  leftRoom: (data: { roomId: string }) => void;
  chatHistory: (data: { roomId: string; messages: ChatMessage[] }) => void;
  newMessage: (data: { roomId: string; message: ChatMessage }) => void;
  roomUpdate: (data: {
    roomId: string;
    room: Room;
    event: string;
    userId?: string;
  }) => void;
}

type EventListener<T extends keyof WebSocketServiceEvents> =
  WebSocketServiceEvents[T];

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<
    keyof WebSocketServiceEvents,
    Set<EventListener<any>>
  > = new Map();
  private currentRoomId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private authErrorCount = 0;
  private maxAuthErrors = 3;
  private isConnecting = false;
  private shouldStopReconnecting = false;

  /**
   * Получить URL для WebSocket соединения
   * WebSocket всегда использует прямой URL, так как не может быть проксирован через rewrites
   */
  private getSocketUrl(): string {
    // Импортируем утилиту для получения WebSocket URL
    const { getWebSocketUrl } = require("@mm-preview/sdk");
    return getWebSocketUrl();
  }

  /**
   * Подключиться к WebSocket серверу
   */
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      console.log("WebSocket уже подключен или подключение в процессе");
      return;
    }

    this.isConnecting = true;

    try {
      const token = getAccessToken();
      const socketUrl = this.getSocketUrl();

      console.log("🔌 Подключение к WebSocket:", socketUrl);

      // Если нужно остановить переподключения, не подключаемся
      if (this.shouldStopReconnecting) {
        console.log("⛔ Подключение заблокировано из-за ошибок аутентификации");
        this.isConnecting = false;
        return;
      }

      const socketConfig: any = {
        transports: ["websocket"],
        reconnection: false, // Отключаем автоматическое переподключение - управляем вручную
        reconnectionDelay: 1000,
        reconnectionAttempts: 0, // Не используем встроенное переподключение
        withCredentials: true,
      };

      if (token) {
        socketConfig.auth = { token };
      }

      this.socket = io(socketUrl, socketConfig);
      this.setupEventHandlers();
    } catch (error) {
      console.error("❌ Ошибка создания WebSocket соединения:", error);
      this.isConnecting = false;
      this.emit("error", {
        message: "Ошибка создания соединения",
        code: "CONNECTION_ERROR",
      });
    }
  }

  /**
   * Настроить обработчики событий Socket.IO
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ WebSocket подключен");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      // Сбрасываем счетчик ошибок аутентификации только если мы не должны останавливать переподключения
      // Это означает, что предыдущее подключение было успешным
      if (!this.shouldStopReconnecting) {
        this.authErrorCount = 0;
      }
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket отключен:", reason);
      this.isConnecting = false;
      this.emit("disconnect", reason);

      // Если нужно остановить переподключения (из-за ошибок аутентификации), не переподключаемся
      if (this.shouldStopReconnecting) {
        console.log(
          "⛔ Переподключения остановлены из-за ошибок аутентификации",
        );
        // Очищаем сокет полностью
        const socketToClean = this.socket;
        this.socket = null;
        if (socketToClean) {
          try {
            socketToClean.removeAllListeners();
          } catch (error) {
            console.error("Ошибка при очистке сокета:", error);
          }
        }
        return;
      }

      // НЕ переподключаемся автоматически - это должно управляться извне
      // Если нужно переподключение, оно должно быть явно вызвано через connect()
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Ошибка подключения WebSocket:", error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;

      // Проверяем, является ли ошибка ошибкой аутентификации
      if (
        error.message?.includes("Authentication required") ||
        error.message?.includes("UNAUTHORIZED")
      ) {
        console.error(
          "❌ Ошибка аутентификации при подключении. Немедленно останавливаем переподключения.",
        );
        this.shouldStopReconnecting = true;
        this.authErrorCount = this.maxAuthErrors; // Устанавливаем максимум

        // Отключаем соединение
        const socketToDisconnect = this.socket;
        this.socket = null; // Сначала обнуляем, чтобы избежать повторных вызовов

        if (socketToDisconnect) {
          try {
            socketToDisconnect.removeAllListeners();
            socketToDisconnect.disconnect();
          } catch (error) {
            console.error("Ошибка при отключении сокета:", error);
          }
        }

        // Очищаем куки и редиректим на страницу входа
        this.handleAuthFailure();
        return;
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit("error", {
          message: `Не удалось подключиться после ${this.maxReconnectAttempts} попыток`,
          code: "MAX_RECONNECT_ATTEMPTS",
        });
      } else {
        this.emit("error", {
          message: `Ошибка подключения: ${error.message}`,
          code: "CONNECTION_ERROR",
        });
      }
    });

    // Token refresh
    this.socket.on(
      "tokenRefreshed",
      (data: { accessToken: string; message?: string }) => {
        console.log(
          "🔄 Токен обновлен через WebSocket:",
          data.message || "Новый access token получен",
        );
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          // Сбрасываем флаги ошибок аутентификации при успешном обновлении токена
          this.authErrorCount = 0;
          this.shouldStopReconnecting = false;
        }
        this.emit("tokenRefreshed", data);
      },
    );

    // My rooms
    this.socket.on("myRooms", (data: { rooms: Room[] }) => {
      console.log("📋 Мои комнаты получены:", data.rooms.length, "комнат");
      this.emit("myRooms", data);
    });

    // Room events
    this.socket.on(
      "joinedRoom",
      (data: { roomId: string; publicCode: string; room: Room }) => {
        this.currentRoomId = data.roomId;
        console.log("✅ Присоединились к комнате:", data.roomId);
        this.emit("joinedRoom", data);
      },
    );

    this.socket.on("leftRoom", (data: { roomId: string }) => {
      if (this.currentRoomId === data.roomId) {
        this.currentRoomId = null;
      }
      console.log("👋 Покинули комнату:", data.roomId);
      this.emit("leftRoom", data);
    });

    // Chat events
    this.socket.on(
      "chatHistory",
      (data: { roomId: string; messages: ChatMessage[] }) => {
        console.log(
          "📜 История чата получена:",
          data.messages.length,
          "сообщений",
        );
        this.emit("chatHistory", data);
      },
    );

    this.socket.on(
      "newMessage",
      (data: { roomId: string; message: ChatMessage }) => {
        console.log("💬 Новое сообщение:", data.message);
        this.emit("newMessage", data);
      },
    );

    // Room updates
    this.socket.on(
      "roomUpdate",
      (data: {
        roomId: string;
        room: Room;
        event: string;
        userId?: string;
      }) => {
        console.log("🔄 Обновление комнаты:", data.event);
        this.emit("roomUpdate", data);
      },
    );

    // Error handling
    this.socket.on(
      "error",
      (error: { message: string; code: string; event?: string }) => {
        console.error("❌ Ошибка WebSocket:", error.message, error.code);

        // Если ошибка аутентификации, сразу останавливаем все попытки
        if (error.code === "UNAUTHORIZED") {
          console.error(
            "❌ Ошибка аутентификации. Немедленно останавливаем переподключения.",
          );
          this.shouldStopReconnecting = true;
          this.authErrorCount = this.maxAuthErrors; // Устанавливаем максимум, чтобы больше не пытаться

          // Отключаем соединение и очищаем
          const socketToDisconnect = this.socket;
          this.socket = null; // Сначала обнуляем, чтобы избежать повторных вызовов

          if (socketToDisconnect) {
            try {
              socketToDisconnect.removeAllListeners();
              socketToDisconnect.disconnect();
            } catch (error) {
              console.error("Ошибка при отключении сокета:", error);
            }
          }

          // Очищаем куки и редиректим на страницу входа
          this.handleAuthFailure();
          return;
        }

        this.emit("error", error);
      },
    );
  }

  /**
   * Обработка неудачной аутентификации
   */
  private async handleAuthFailure(): Promise<void> {
    const { removeAllAuthTokens } = await import("@mm-preview/sdk");
    removeAllAuthTokens();

    // Определяем URL для user-creation динамически
    let userCreationUrl: string | null = null;

    // Проверяем переменную окружения
    if (process.env.NEXT_PUBLIC_USER_CREATION_URL) {
      userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
    } else if (typeof window !== "undefined") {
      // Динамическое определение URL
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      // Production - определяем домен на основе текущего домена
      if (hostname.includes("moviematch.space")) {
        userCreationUrl = "https://start.moviematch.space";
      } else if (hostname.includes("vercel.app")) {
        const parts = hostname.split(".");
        const baseDomain =
          parts.length >= 2 ? parts.slice(-2).join(".") : "vercel.app";
        userCreationUrl = `https://mm-preview-user-creation.${baseDomain}`;
      }
      // Dev mode - IP address or localhost
      else if (
        /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
        hostname === "localhost" ||
        hostname === "127.0.0.1"
      ) {
        userCreationUrl = `${protocol}//${hostname}:3001`;
      }
    }

    if (!userCreationUrl) {
      console.error("❌ Could not determine user creation URL");
      return;
    }

    console.error(
      "🔴 Перенаправление на страницу входа из-за ошибок аутентификации",
    );
    window.location.href = userCreationUrl;
  }

  /**
   * Отключиться от WebSocket сервера
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log("🔌 WebSocket отключен");
    }
  }

  /**
   * Подписаться на событие
   */
  on<T extends keyof WebSocketServiceEvents>(
    event: T,
    listener: EventListener<T>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Возвращаем функцию для отписки
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Отписаться от события
   */
  off<T extends keyof WebSocketServiceEvents>(
    event: T,
    listener: EventListener<T>,
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Вызвать событие для всех подписчиков
   */
  private emit<T extends keyof WebSocketServiceEvents>(
    event: T,
    ...args: Parameters<WebSocketServiceEvents[T]>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Ошибка в обработчике события ${event}:`, error);
        }
      });
    }
  }

  /**
   * Получить список моих комнат
   */
  getMyRooms(): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "NOT_CONNECTED",
        event: "getMyRooms",
      });
      return;
    }

    console.log("📋 Запрос моих комнат...");
    this.socket.emit("getMyRooms", {});
  }

  /**
   * Присоединиться к комнате
   */
  joinRoom(publicCode: string, userId: string): void {
    if (!this.socket?.connected) {
      console.warn("⚠️ WebSocket не подключен, пытаемся подключиться...");
      // Пытаемся подключиться, если еще не подключены
      if (!this.isConnecting) {
        this.connect();
      }
      // Откладываем joinRoom до подключения (максимум 5 секунд)
      let attempts = 0;
      const maxAttempts = 50; // 50 попыток по 100мс = 5 секунд
      const checkConnection = () => {
        attempts++;
        if (this.socket?.connected) {
          this.socket.emit("joinRoom", { publicCode, userId });
          console.log("✅ Присоединились к комнате после подключения");
        } else if (attempts >= maxAttempts || (!this.isConnecting && !this.socket)) {
          // Если не удалось подключиться, отправляем ошибку
          this.emit("error", {
            message: "WebSocket не подключен. Не удалось подключиться.",
            code: "NOT_CONNECTED",
            event: "joinRoom",
          });
        } else {
          // Продолжаем ждать подключения
          setTimeout(checkConnection, 100);
        }
      };
      setTimeout(checkConnection, 100);
      return;
    }

    if (!publicCode || !userId) {
      this.emit("error", {
        message: "publicCode и userId обязательны",
        code: "BAD_REQUEST",
        event: "joinRoom",
      });
      return;
    }

    console.log("🚪 Присоединение к комнате:", publicCode);
    this.socket.emit("joinRoom", { publicCode, userId });
  }

  /**
   * Покинуть комнату
   */
  leaveRoom(roomId: string, userId: string): void {
    if (!this.socket?.connected) {
      this.emit("error", {
        message: "WebSocket не подключен",
        code: "NOT_CONNECTED",
        event: "leaveRoom",
      });
      return;
    }

    if (!roomId || !userId) {
      this.emit("error", {
        message: "roomId и userId обязательны",
        code: "BAD_REQUEST",
        event: "leaveRoom",
      });
      return;
    }

    console.log("👋 Выход из комнаты:", roomId);
    this.socket.emit("leaveRoom", { roomId, userId });
  }

  /**
   * Отправить сообщение в чат
   */
  sendMessage(roomId: string, message: string): void {
    if (!this.socket?.connected) {
      console.warn("⚠️ WebSocket не подключен при попытке отправить сообщение");
      // Пытаемся подключиться, если еще не подключены
      if (!this.isConnecting) {
        this.connect();
      }
      this.emit("error", {
        message: "WebSocket не подключен. Пожалуйста, подождите подключения.",
        code: "NOT_CONNECTED",
        event: "sendMessage",
      });
      return;
    }

    if (!roomId || !message || message.trim().length === 0) {
      this.emit("error", {
        message: "roomId и message обязательны",
        code: "BAD_REQUEST",
        event: "sendMessage",
      });
      return;
    }

    if (message.length > 1000) {
      this.emit("error", {
        message: "Сообщение слишком длинное (максимум 1000 символов)",
        code: "BAD_REQUEST",
        event: "sendMessage",
      });
      return;
    }

    console.log("💬 Отправка сообщения в комнату:", roomId);
    this.socket.emit("sendMessage", { roomId, message: message.trim() });
  }

  /**
   * Переподключиться к комнате
   */
  reconnectToRoom(roomId: string, publicCode: string, userId: string): void {
    this.joinRoom(publicCode, userId);
  }

  /**
   * Проверить, подключен ли WebSocket
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Получить текущий roomId
   */
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  /**
   * Обновить токен и переподключиться
   */
  async refreshTokenAndReconnect(): Promise<void> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // Пытаемся обновить через API (HTTP-only cookie)
        const { authApi } = await import("@mm-preview/sdk");
        const response = await authApi.refreshToken();
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
          // Переподключаемся с новым токеном
          this.disconnect();
          this.connect();
        }
      } else {
        // Если refresh_token доступен, просто переподключаемся
        this.disconnect();
        this.connect();
      }
    } catch (error: any) {
      console.error("❌ Ошибка обновления токена:", error);
      // Если токен невалидный (401/403), очищаем куки и редиректим на страницу входа
      if (error?.status === 401 || error?.status === 403) {
        const { removeAllAuthTokens } = await import("@mm-preview/sdk");
        removeAllAuthTokens();
        const userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL;
        if (!userCreationUrl) {
          console.error("❌ NEXT_PUBLIC_USER_CREATION_URL is not set");
          return;
        }
        window.location.href = userCreationUrl;
      } else {
        this.emit("error", {
          message: "Не удалось обновить токен",
          code: "TOKEN_REFRESH_ERROR",
        });
      }
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
