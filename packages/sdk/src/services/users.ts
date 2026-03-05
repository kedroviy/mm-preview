import { api } from "../client";

export interface User {
  userId: string;
  name: string;
  lastActive: number;
  role: "user" | "admin";
  recentRooms?: string[];
}

export interface UserProfile extends User {
  rooms: Array<{
    roomId: string;
    publicCode: string;
    users: string[];
    isMember?: boolean;
    isCreator?: boolean;
  }>;
}

export interface CreateUserRequest {
  name: string;
  userId?: string;
}

export interface UpdateUserRequest {
  name?: string;
}

export const usersApi = {
  /**
   * Получить профиль текущего аутентифицированного пользователя (из JWT).
   * GET /api/v1/users/profile
   */
  getProfile: async () => {
    return api.get<UserProfile>("/api/v1/users/profile");
  },

  /**
   * Получить список пользователей
   */
  getUsers: async (params?: { page?: number; limit?: number }) => {
    return api.get<User[]>("/api/v1/users", { params });
  },

  /**
   * Получить пользователя по ID (только для admins)
   */
  getUserById: async (userId: string) => {
    return api.get<User>(`/api/v1/users/${userId}`);
  },

  /**
   * Создать нового пользователя
   */
  createUser: async (data: CreateUserRequest) => {
    return api.post<User>("/api/v1/users", data);
  },

  /**
   * Обновить имя пользователя
   */
  updateUserName: async (userId: string, name: string) => {
    return api.patch<User>(`/api/v1/users/${userId}/name`, { name });
  },
};
