// This file is a stub. Run "npm run generate:all" to generate actual hooks.
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

export function useUsersController_getProfile(
  options?: UseQueryOptions<unknown, Error, unknown, readonly unknown[]>
): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: ['users', 'UsersController_getProfile', '__stub__'],
    queryFn: () => Promise.resolve(null),
    enabled: false,
    ...options,
  }) as UseQueryResult<unknown, Error>;
}

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'] as const,
  UsersController_getUser: (_path: { userId: string }) => ['users', 'UsersController_getUser'] as const,
} as const;
