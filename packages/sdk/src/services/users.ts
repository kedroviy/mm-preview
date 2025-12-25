import { api } from "../client";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
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
  getUserById: async (id: string) => {
    return api.get<User>(`/users/${id}`);
  },

  /**
   * Создать нового пользователя
   */
  createUser: async (data: CreateUserRequest) => {
    return api.post<User>("/users", data);
  },

  /**
   * Обновить пользователя
   */
  updateUser: async (id: string, data: UpdateUserRequest) => {
    return api.put<User>(`/users/${id}`, data);
  },

  /**
   * Удалить пользователя
   */
  deleteUser: async (id: string) => {
    return api.delete<void>(`/users/${id}`);
  },
};

