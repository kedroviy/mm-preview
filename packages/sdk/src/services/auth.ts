import { api } from "../client";

export interface LoginRequest {
  name: string;
}

export interface LoginResponse {
  userId: string;
  name: string;
}

export const authApi = {
  /**
   * Login by name: POST /api/v1/auth/login -> { userId, name }
   *
   * Backend sets JWT tokens in HTTP-only cookies.
   */
  login: async (data: LoginRequest) => {
    return api.post<LoginResponse>("/api/v1/auth/login", data);
  },

  /**
   * Logout: POST /api/v1/auth/logout
   *
   * Clears auth cookies on the backend.
   */
  logout: async () => {
    return api.post<void>("/api/v1/auth/logout");
  },
};
