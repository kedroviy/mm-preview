import {
  type CreateUserRequest,
  useCreateUser as useSDKCreateUser,
} from "@mm-preview/sdk";
import type { UseMutationOptions } from "@tanstack/react-query";

export function useCreateUser() {
  const mutation = useSDKCreateUser();

  const mutate = (
    data: CreateUserRequest,
    options?: UseMutationOptions<unknown, unknown, CreateUserRequest>,
  ) => {
    mutation.mutate(data, options);
  };

  return {
    ...mutation,
    mutate,
  };
}
