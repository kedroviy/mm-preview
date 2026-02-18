import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateUserRequest, usersApi } from "../services/users";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await usersApi.getUsers(params);
      return response.data;
    },
  });
}

export function useUser(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await usersApi.getUserById(id);
      return response.data;
    },
    enabled: !!id && options?.enabled !== false,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await usersApi.createUser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUserName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
      const response = await usersApi.updateUserName(userId, name);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
