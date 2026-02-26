import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { UsersController_createUser, UsersController_getProfile, UsersController_getUser, UsersController_deleteUser, UsersController_updateName } from '../requests/users';
import type { ApiResponse } from '../../types';

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'],
  UsersController_getUser: (userId: string) => ['users', 'UsersController_getUser', ...Object.values({ userId })],
} as const;

/**
 * Create a new user
 */
export function useUsersController_createUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateRedisUserDto) => {
      
      const response: ApiResponse<RedisUserResponseDto> = await UsersController_createUser(data);
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
export function useUsersController_getProfile(options?: UseQueryOptions<UserProfileResponseDto>) {
  return useQuery({
    queryKey: usersKeys.UsersController_getProfile(),
    queryFn: async () => {
      const response: ApiResponse<UserProfileResponseDto> = await UsersController_getProfile();
      return response.data;
    },
    ...options,
  });
}


/**
 * Get user by ID (admin only)
 */
export function useUsersController_getUser(path: { userId: string }, options?: UseQueryOptions<RedisUserResponseDto>) {
  return useQuery({
    queryKey: usersKeys.UsersController_getUser(path),
    queryFn: async () => {
      const response: ApiResponse<RedisUserResponseDto> = await UsersController_getUser(path);
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
    mutationFn: async () => {
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
      const response: ApiResponse<RedisUserResponseDto> = await UsersController_updateName({ userId }, rest);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
