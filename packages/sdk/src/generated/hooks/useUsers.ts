import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { type UserProfile, usersApi } from "../../services/users";

export const usersKeys = {
  UsersController_getProfile: () =>
    ["users", "UsersController_getProfile"] as const,
  UsersController_getUser: (_path: { userId: string }) =>
    ["users", "UsersController_getUser"] as const,
} as const;

export function useUsersController_getProfile(
  options?: UseQueryOptions<
    UserProfile,
    Error,
    UserProfile,
    readonly unknown[]
  >,
): UseQueryResult<UserProfile, Error> {
  return useQuery({
    queryKey: usersKeys.UsersController_getProfile(),
    queryFn: async () => {
      const response = await usersApi.getProfile();
      return response.data;
    },
    ...options,
  }) as UseQueryResult<UserProfile, Error>;
}
