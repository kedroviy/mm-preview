import { api } from "../client";
import { removeAllAuthTokens, setAccessToken } from "../utils/cookies";

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Login (movie-match): POST /auth/login -> { token }
   */
  login: async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>("/auth/login", data);
    if (res.data?.token) setAccessToken(res.data.token);
    return res;
  },

  /**
   * Register (movie-match): POST /auth/register -> { message }
   * We keep it typed loosely and allow chaining login on the client.
   */
  register: async (data: RegisterRequest) => {
    return api.post<{ message?: string }>("/auth/register", data);
  },

  /**
   * Logout (client-side only): clears stored JWT.
   */
  logout: async () => {
    removeAllAuthTokens();
    return { data: undefined, status: 200, statusText: "OK" };
  },
};
