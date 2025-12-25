import { usersApi, type CreateUserRequest, type User } from "@mm-preview/sdk";

export type { CreateUserRequest };

export interface CreateUserResponse extends User {}

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const response = await usersApi.createUser(data);
  return response.data;
}

