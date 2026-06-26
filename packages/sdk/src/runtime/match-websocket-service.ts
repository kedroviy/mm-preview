import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "./auth-tokens";
import { getWebSocketRoomsUrl } from "./websocket-url";

export type BroadcastMoviesPayload = {
	type?: string;
	messageForClient?: string;
	roomKey?: string;
	aggregateVersion?: number;
	matchPhase?: string;
};

export type MatchWebSocketEvents = {
	connect: () => void;
	disconnect: () => void;
	broadcastMovies: (data: BroadcastMoviesPayload) => void;
	matchUpdated: (data: unknown) => void;
	broadcastMatchDataUpdated: (data: unknown) => void;
	filtersUpdated: (data: unknown) => void;
	startMatchResponse: (data: unknown) => void;
	error: (error: { message?: string }) => void;
};

type EventKey = keyof MatchWebSocketEvents;

class MatchWebSocketService {
	private socket: Socket | null = null;
	private readonly listeners = new Map<
		EventKey,
		Set<(...args: unknown[]) => void>
	>();
	private lastJoinedRoom: { roomKey: string; userId: string } | null = null;

	isConnected(): boolean {
		return !!this.socket?.connected;
	}

	connect(token?: string): void {
		const authToken = token ?? getAccessToken() ?? undefined;
		const url = `${getWebSocketRoomsUrl()}/rooms`;

		if (this.socket) {
			this.socket.auth = { token: authToken };
			if (!this.socket.connected) {
				this.socket.connect();
			}
			return;
		}

		this.socket = io(url, {
			transports: ["websocket", "polling"],
			auth: authToken ? { token: authToken } : {},
			withCredentials: true,
		});

		this.socket.on("connect", () => {
			this.emitLocal("connect");
			if (this.lastJoinedRoom) {
				this.socket?.emit("joinRoom", this.lastJoinedRoom);
			}
		});

		this.socket.on("disconnect", () => this.emitLocal("disconnect"));

		for (const event of [
			"broadcastMovies",
			"matchUpdated",
			"broadcastMatchDataUpdated",
			"filtersUpdated",
			"startMatchResponse",
			"error",
		] as const) {
			this.socket.on(event, (...args: unknown[]) => {
				this.emitLocal(event, ...args);
			});
		}
	}

	on<T extends EventKey>(
		event: T,
		listener: MatchWebSocketEvents[T],
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

	joinMatchRoom(roomKey: string, userId: string): void {
		this.lastJoinedRoom = { roomKey, userId };
		this.socket?.emit("joinRoom", { roomKey, userId });
	}

	requestBroadcastMovies(roomKey: string): void {
		this.socket?.emit("startBroadcastingMovies", roomKey);
	}

	requestMatchData(roomKey: string): void {
		this.socket?.emit("requestMatchData", { roomKey });
	}
}

export const matchWebSocketService = new MatchWebSocketService();
