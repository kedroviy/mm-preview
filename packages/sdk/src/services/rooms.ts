import { api } from "../client";
import type { ApiResponse } from "../types";
import { getAccessToken } from "../utils/cookies";
import { decodeJWT } from "../utils/jwt";

export type RoomRole = "room_creator" | "room_member";

export interface Room {
  roomId: string;
  publicCode: string;
  createdBy?: string | null;
  users: string[];
  userRoles: Record<string, RoomRole>;
  choices: Record<string, string>;
  isMember: boolean;
  isCreator: boolean;
  canManage: boolean;
  currentUserRole?: RoomRole;
  createdAt: number;
  updatedAt: number;
  isMuted?: boolean; // Is current user muted
  muteExpiresAt?: number; // Mute expiration timestamp
}

export interface ChatMessage {
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: number;
}

export interface RoomMember {
  userId: string;
  role: RoomRole;
  name: string;
}

export interface CreateRoomRequest {
  name?: string;
  filters?: unknown;
}

export interface CreateRoomResponse {
  roomId: string;
  publicCode: string;
}

export interface JoinRoomRequest {
  publicCode: string; // roomKey
}

export interface LeaveRoomRequest {
  roomKey: string;
}

export interface ChooseMovieRequest {
  // not implemented for movie-match yet (match module uses different endpoints)
  movieId: string;
}

export interface SendChatMessageRequest {
  roomId: string;
  message: string;
}

export const roomsApi = {
  /**
   * Создать новую комнату
   */
  createRoom: async (data?: CreateRoomRequest) => {
    const res = await api.post<{ roomKey: string }>("/rooms/create", data);
    const roomKey = res.data?.roomKey;
    return {
      ...res,
      data: {
        roomId: roomKey,
        publicCode: roomKey,
      } as CreateRoomResponse,
    };
  },

  /**
   * Получить агрегат комнаты по roomKey
   */
  getRoom: async (roomId: string) => {
    const res = await api.get<{
      roomKey: string;
      roomId: string;
      participants: Array<{ userId: number; userName: string; role: string }>;
    }>(`/rooms/${encodeURIComponent(roomId)}/state`);

    const token = getAccessToken();
    const decoded = token ? decodeJWT(token) : null;
    const currentUserIdRaw = decoded?.id ?? decoded?.userId ?? decoded?.sub;
    const currentUserId =
      typeof currentUserIdRaw === "number"
        ? String(currentUserIdRaw)
        : typeof currentUserIdRaw === "string"
          ? currentUserIdRaw
          : null;

    const participants = res.data?.participants ?? [];
    const users = participants.map((p) => String(p.userId));
    const userRoles: Record<string, RoomRole> = {};
    for (const p of participants) {
      userRoles[String(p.userId)] =
        p.role === "admin" ? "room_creator" : "room_member";
    }
    const currentUserRole = currentUserId ? userRoles[currentUserId] : undefined;

    const room: Room = {
      roomId: res.data.roomId,
      publicCode: res.data.roomKey,
      createdBy: null,
      users,
      userRoles,
      choices: {},
      isMember: true,
      isCreator: currentUserRole === "room_creator",
      canManage: currentUserRole === "room_creator",
      currentUserRole,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return { ...res, data: room };
  },

  /**
   * Присоединиться к комнате по публичному коду
   */
  joinRoom: async (data: JoinRoomRequest) => {
    const token = getAccessToken();
    const decoded = token ? decodeJWT(token) : null;
    const userIdRaw = decoded?.id ?? decoded?.userId ?? decoded?.sub;
    const userId = typeof userIdRaw === "number" ? userIdRaw : Number(userIdRaw);
    if (!Number.isFinite(userId)) {
      throw new Error("Cannot join room without userId in token");
    }

    // movie-match currently expects userId in body.
    await api.post<void>(`/rooms/join/${encodeURIComponent(data.publicCode)}`, {
      userId,
    });

    // Return room state (mapped to dashboard Room)
    return roomsApi.getRoom(data.publicCode);
  },

  /**
   * Покинуть комнату
   */
  leaveRoom: async (roomId: string, data: LeaveRoomRequest) => {
    await api.post<{ message?: string }>("/rooms/my/leave", {
      roomKey: data.roomKey,
    });
    // best-effort: return latest room aggregate if still accessible
    return roomsApi.getRoom(roomId);
  },

  /**
   * Выбрать фильм в комнате
   */
  chooseMovie: async (
    roomId: string,
    data: ChooseMovieRequest,
  ): Promise<ApiResponse<Room>> => {
    // Not wired: movie-match uses /match/like + /match/check-status.
    throw new Error("chooseMovie is not implemented for movie-match yet");
  },

  /**
   * Получить список участников комнаты с ролями
   */
  getRoomMembers: async (roomId: string) => {
    const state = await api.get<{
      participants: Array<{ userId: number; userName: string; role: string }>;
    }>(`/rooms/${encodeURIComponent(roomId)}/state`);
    const members: RoomMember[] = (state.data?.participants ?? []).map((p) => ({
      userId: String(p.userId),
      role: p.role === "admin" ? "room_creator" : "room_member",
      name: p.userName,
    }));
    return { ...state, data: { members } };
  },

  /**
   * Удалить пользователя из комнаты (только создатель)
   */
  removeUserFromRoom: async (
    roomId: string,
    userId: string,
  ): Promise<ApiResponse<Room>> => {
    throw new Error("removeUserFromRoom is not implemented for movie-match yet");
  },

  /**
   * Получить историю чата комнаты
   */
  getChatHistory: async (roomId: string) => {
    return { data: { messages: [] as ChatMessage[] }, status: 200, statusText: "OK" };
  },

  /**
   * Получить список комнат текущего пользователя
   */
  getMyRooms: async () => {
    const res = await api.get<
      Array<{
        roomKey: string;
        roomId: string;
        role: string;
        isAuthor: boolean;
        roomName: string | null;
      }>
    >("/rooms/my/memberships");

    const token = getAccessToken();
    const decoded = token ? decodeJWT(token) : null;
    const currentUserIdRaw = decoded?.id ?? decoded?.userId ?? decoded?.sub;
    const currentUserId =
      typeof currentUserIdRaw === "number"
        ? String(currentUserIdRaw)
        : typeof currentUserIdRaw === "string"
          ? currentUserIdRaw
          : null;

    const rooms: Room[] = (res.data ?? []).map((m) => {
      const role: RoomRole = m.isAuthor ? "room_creator" : "room_member";
      const userRoles: Record<string, RoomRole> = {};
      if (currentUserId) userRoles[currentUserId] = role;
      return {
        roomId: m.roomId ?? m.roomKey,
        publicCode: m.roomKey,
        createdBy: null,
        users: currentUserId ? [currentUserId] : [],
        userRoles,
        choices: {},
        isMember: true,
        isCreator: role === "room_creator",
        canManage: role === "room_creator",
        currentUserRole: role,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });

    return { ...res, data: rooms };
  },
};
