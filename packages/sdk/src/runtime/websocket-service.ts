import { io, type Socket } from "socket.io-client";
import type { ChatMessage, Room, RoomMember } from "../types/dashboard-app";
import { getAccessToken } from "./auth-tokens";
import { getWebSocketRoomsUrl } from "./websocket-url";

export type WebSocketServiceEvents = {
	connect: () => void;
	disconnect: () => void;
	joinedRoom: (data: {
		roomId: string;
		publicCode: string;
		room: Room;
	}) => void;
	myRooms: (data: { rooms: Room[] }) => void;
	tokenRefreshed: () => void;
	roomUpdate: (data: {
		roomId: string;
		members?: RoomMember[];
		room?: Room;
		event?: string;
		userId?: string;
	}) => void;
	chatHistory: (data: { roomId: string; messages: ChatMessage[] }) => void;
	newMessage: (data: { roomId: string; message: ChatMessage }) => void;
	error: (error: { code: string; message?: string; event?: string }) => void;
};

type EventKey = keyof WebSocketServiceEvents;

class WebSocketService {
	private socket: Socket | null = null;
	private readonly listeners = new Map<EventKey, Set<(...args: unknown[]) => void>>();
	private currentRoomId: string | null = null;

	isConnected(): boolean {
		return !!this.socket?.connected;
	}

	connect(token?: string): void {
		const authToken = token ?? getAccessToken() ?? undefined;
		const url = getWebSocketRoomsUrl();

		if (this.socket) {
			this.socket.auth = { token: authToken };
			if (!this.socket.connected) {
				this.socket.connect();
			}
			return;
		}

		this.socket = io(url, {
			transports: ["websocket"],
			auth: authToken ? { token: authToken } : {},
			withCredentials: true,
		});

		this.socket.on("connect", () => this.emitLocal("connect"));
		this.socket.on("disconnect", () => this.emitLocal("disconnect"));

		const forward = (event: EventKey) => {
			this.socket?.on(event, (...args: unknown[]) => {
				if (
					event === "joinedRoom" &&
					args[0] &&
					typeof args[0] === "object" &&
					args[0] !== null &&
					"roomId" in args[0]
				) {
					this.currentRoomId = String(
						(args[0] as { roomId: string }).roomId,
					);
				}
				this.emitLocal(event, ...args);
			});
		};

		for (const ev of [
			"joinedRoom",
			"myRooms",
			"tokenRefreshed",
			"roomUpdate",
			"chatHistory",
			"newMessage",
			"error",
		] as const) {
			forward(ev);
		}
	}

	on<T extends EventKey>(
		event: T,
		listener: WebSocketServiceEvents[T],
	): () => void {
		let set = this.listeners.get(event);
		if (!set) {
			set = new Set();
			this.listeners.set(event, set);
		}
		const wrapped = listener as (...args: unknown[]) => void;
		set.add(wrapped);
		return () => {
			set?.delete(wrapped);
		};
	}

	off<T extends EventKey>(
		event: T,
		listener: WebSocketServiceEvents[T],
	): void {
		const set = this.listeners.get(event);
		set?.delete(listener as (...args: unknown[]) => void);
	}

	private emitLocal(event: EventKey, ...args: unknown[]): void {
		const set = this.listeners.get(event);
		if (!set) return;
		for (const fn of set) {
			try {
				(fn as (...a: unknown[]) => void)(...args);
			} catch {
				/* listener errors should not break socket */
			}
		}
	}

	getMyRooms(): void {
		this.socket?.emit("getMyRooms", {});
	}

	joinRoom(
		publicCode: string,
		userId: string,
		clientRoomId?: string,
	): void {
		this.socket?.emit("joinRoom", { publicCode, userId, clientRoomId });
	}

	leaveRoom(roomId: string, userId: string): void {
		this.socket?.emit("leaveRoom", { roomId, userId });
	}

	sendMessage(roomId: string, message: string): void {
		this.socket?.emit("sendMessage", { roomId, message });
	}

	reconnectToRoom(
		roomId: string,
		publicCode: string,
		userId: string,
	): void {
		this.socket?.emit("reconnectToRoom", { roomId, publicCode, userId });
	}

	getCurrentRoomId(): string | null {
		return this.currentRoomId;
	}

	refreshTokenAndReconnect(): Promise<void> {
		const t = getAccessToken() ?? undefined;
		this.socket?.disconnect();
		this.socket = null;
		this.currentRoomId = null;
		this.connect(t);
		return Promise.resolve();
	}
}

export const webSocketService = new WebSocketService();
