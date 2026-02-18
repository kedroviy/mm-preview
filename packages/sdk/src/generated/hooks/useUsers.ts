// This file is a stub. Run "npm run generate:swagger" and "npm run generate:hooks" to generate actual hooks.
import type { UseQueryOptions } from '@tanstack/react-query';

export function useUsersController_getProfile(_options?: UseQueryOptions<any>) {
  throw new Error('This is a stub. Run "npm run generate:all" to generate actual hooks.');
}

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'] as const,
  UsersController_getUser: (_path: { userId: string }) => ['users', 'UsersController_getUser'] as const,
} as const;
