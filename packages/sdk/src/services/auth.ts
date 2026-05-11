import { api } from "../client";
import type { ApiResponse } from "../types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authApi = {
  /**
   * movie-match: POST /auth/login → `{ token }`
   */
  login: async (data: LoginRequest) => {
    return api.post<LoginResponse>("/auth/login", data);
  },

  /**
   * movie-match has no logout endpoint; tokens are cleared client-side.
   */
  logout: async (): Promise<ApiResponse<void>> => {
    return { data: undefined, status: 204, statusText: "No Content" };
  },
};
