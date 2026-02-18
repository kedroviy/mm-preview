import { api } from "../client";

export interface User {
  userId: string;
  name: string;
  lastActive: number;
  role: "user" | "admin";
  recentRooms?: string[];
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
   * Получить список пользователей
   */
  getUsers: async (params?: { page?: number; limit?: number }) => {
    return api.get<User[]>("/users", { params });
  },

  /**
   * Получить пользователя по ID
   */
  getUserById: async (userId: string) => {
    return api.get<User>(`/users/${userId}`);
  },

  /**
   * Создать нового пользователя
   * Токен автоматически устанавливается в куки через Set-Cookie заголовок
   */
  createUser: async (data: CreateUserRequest) => {
    return api.post<User>("/users", data);
  },

  /**
   * Обновить имя пользователя
   */
  updateUserName: async (userId: string, name: string) => {
    return api.patch<User>(`/users/${userId}/name`, { name });
  },
};
