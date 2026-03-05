import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { UsersController_createUser, UsersController_getProfile, UsersController_getUser, UsersController_deleteUser, UsersController_updateName } from '../requests/users';
import type { ApiResponse } from '../../types';

export const usersKeys = {
  UsersController_getProfile: (...args: any[]) => ['users', 'UsersController_getProfile', ...args] as const,
  UsersController_getUser: (...args: any[]) => ['users', 'UsersController_getUser', ...args] as const,
} as const;

/**
 * Create a new user
 */
export function useUsersController_createUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      
      const response: ApiResponse<any> = await UsersController_createUser(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}


/**
 * Get current user profile
 */
export function useUsersController_getProfile(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: usersKeys.UsersController_getProfile(),
    queryFn: async () => {
      const response: ApiResponse<any> = await UsersController_getProfile();
      return response.data;
    },
    ...options,
  });
}


/**
 * Get user by ID (admin only)
 */
export function useUsersController_getUser(path: { userId: string }, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: usersKeys.UsersController_getUser(path),
    queryFn: async () => {
      const response: ApiResponse<any> = await UsersController_getUser(path);
      return response.data;
    },
    ...options,
  });
}


/**
 * Delete user
 */
export function useUsersController_deleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { userId, ...rest } = data as any;
      const response: ApiResponse<any> = await UsersController_deleteUser({ userId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}


/**
 * Update user name
 */
export function useUsersController_updateName() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { userId, ...rest } = data as any;
      const response: ApiResponse<any> = await UsersController_updateName({ userId }, rest);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
