// Aligned with movie-match Nest routes (no /api/v1 prefix).
import * as v from "valibot";
import type { Client } from "../../types";
import {
  adminLoginDtoSchema,
  loginDtoSchema,
  loginResponseDtoSchema,
  type AdminLoginDto,
  type LoginDto,
  type LoginResponseDto,
} from "../schemas";

export function loginOptions(config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["auth", "login"] as const,
    mutationFn: async (body: LoginDto) => {
      const response = await config.client.post("/auth/login", body, {
        credentials: config.credentials ?? "include",
        headers: config.headers,
      });
      return v.parse(loginResponseDtoSchema, response.data) as LoginResponseDto;
    },
  };
}

export function refreshTokenOptions(config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["auth", "refreshToken"] as const,
    mutationFn: async () => {
      throw new Error(
        "movie-match backend has no POST /auth/refresh; use a new login or keep access_token valid",
      );
    },
  };
}

export function logoutOptions(config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["auth", "logout"] as const,
    mutationFn: async () => {
      throw new Error(
        "movie-match backend has no POST /auth/logout; clear tokens on the client",
      );
    },
  };
}

export function adminLoginOptions(config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["auth", "adminLogin"] as const,
    mutationFn: async (body: AdminLoginDto) => {
      void v.parse(adminLoginDtoSchema, body);
      throw new Error(
        "movie-match backend has no POST /auth/admin/login",
      );
    },
  };
}
