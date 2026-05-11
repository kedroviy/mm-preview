// Aligned with movie-match Nest routes (no /api/v1 prefix).
import * as v from "valibot";
import type { Client } from "../../types";
import {
  registerUserDtoSchema,
  successMessageDtoSchema,
  userProfileResponseDtoSchema,
  userResponseDtoSchema,
  usersController_updateNameBodySchema,
  type RegisterUserDto,
  type SuccessMessageDto,
  type UserProfileResponseDto,
  type UserResponseDto,
  type UsersController_updateNameBody,
} from "../schemas";

export function createUserOptions(config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["users", "createUser"] as const,
    mutationFn: async (body: RegisterUserDto) => {
      const parsed = v.parse(registerUserDtoSchema, body);
      const response = await config.client.post("/auth/register", parsed, {
        credentials: config.credentials ?? "include",
        headers: config.headers,
      });
      return v.parse(successMessageDtoSchema, response.data) as SuccessMessageDto;
    },
  };
}

export function getProfileOptions(config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["users", "getProfile"] as const,
    queryFn: async (): Promise<UserProfileResponseDto> => {
      const response = await config.client.get("/user/me", {
        credentials: config.credentials ?? "include",
        headers: config.headers,
      });
      const raw = response.data as {
        id: number;
        email: string;
        username: string;
      };
      const mapped: UserProfileResponseDto = {
        userId: String(raw.id),
        name: raw.username,
        role: "user",
        rooms: [],
      };
      return v.parse(userProfileResponseDtoSchema, mapped);
    },
  };
}

export function getAllUsersOptions(config: {
  client: Client;
  query?: { id?: string; name?: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["users", "getAllUsers", config.query] as const,
    queryFn: async (): Promise<UserResponseDto[]> => {
      throw new Error(
        "UsersController_getAllUsers is not available on movie-match backend",
      );
    },
  };
}

export function getUserOptions(config: {
  client: Client;
  path: { userId: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["users", "getUser", config.path] as const,
    queryFn: async () => {
      throw new Error(
        "UsersController_getUser is not available on movie-match backend",
      );
    },
  };
}

export function deleteUserOptions(config: {
  client: Client;
  path: { userId: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["users", "deleteUser", config.path] as const,
    mutationFn: async () => {
      const email = encodeURIComponent(config.path.userId);
      const response = await config.client.delete(`/user/${email}`, {
        credentials: config.credentials ?? "include",
        headers: config.headers,
      });
      return response.data as { message: string };
    },
  };
}

export function updateNameOptions(config: {
  client: Client;
  path: { userId: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["users", "updateName", config.path] as const,
    mutationFn: async (body: UsersController_updateNameBody) => {
      const response = await config.client.patch(
        "/user/update-username",
        {
          userId: Number(config.path.userId),
          newUsername: body.newUsername,
        },
        {
          credentials: config.credentials ?? "include",
          headers: config.headers,
        },
      );
      return response.data as unknown;
    },
  };
}
