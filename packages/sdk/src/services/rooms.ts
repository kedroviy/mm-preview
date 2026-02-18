import { api } from "../client";

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
}

export interface CreateRoomResponse {
  roomId: string;
  publicCode: string;
}

export interface JoinRoomRequest {
  publicCode: string;
  userId: string;
}

export interface LeaveRoomRequest {
  userId: string;
}

export interface ChooseMovieRequest {
  userId: string;
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
    return api.post<CreateRoomResponse>("/rooms", data);
  },

  /**
   * Получить комнату по ID
   */
  getRoom: async (roomId: string) => {
    return api.get<Room>(`/rooms/${roomId}`);
  },

  /**
   * Присоединиться к комнате по публичному коду
   */
  joinRoom: async (data: JoinRoomRequest) => {
    return api.post<Room>("/rooms/join", data);
  },

  /**
   * Покинуть комнату
   */
  leaveRoom: async (roomId: string, data: LeaveRoomRequest) => {
    return api.post<Room>(`/rooms/${roomId}/leave`, data);
  },

  /**
   * Выбрать фильм в комнате
   */
  chooseMovie: async (roomId: string, data: ChooseMovieRequest) => {
    return api.post<Room>(`/rooms/${roomId}/choice`, data);
  },

  /**
   * Получить список участников комнаты с ролями
   */
  getRoomMembers: async (roomId: string) => {
    return api.get<{ members: RoomMember[] }>(`/rooms/${roomId}/members`);
  },

  /**
   * Удалить пользователя из комнаты (только создатель)
   */
  removeUserFromRoom: async (roomId: string, userId: string) => {
    return api.delete<Room>(`/rooms/${roomId}/members/${userId}`);
  },

  /**
   * Получить историю чата комнаты
   */
  getChatHistory: async (roomId: string) => {
    return api.get<{ messages: ChatMessage[] }>(`/rooms/${roomId}/chat/history`);
  },
};

