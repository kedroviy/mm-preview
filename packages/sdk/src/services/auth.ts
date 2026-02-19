import { api } from "../client";

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  // Может быть и другой формат ответа
  [key: string]: unknown;
}

export const authApi = {
  /**
   * Обновить access token используя refresh token
   * Refresh token может быть в cookie или в теле запроса
   */
  refreshToken: async (data?: RefreshTokenRequest) => {
    return api.post<AuthResponse>("/auth/refresh", data);
  },

  /**
   * Выйти из системы (удаляет refresh token и очищает cookies)
   */
  logout: async () => {
    return api.post<void>("/auth/logout");
  },
};
