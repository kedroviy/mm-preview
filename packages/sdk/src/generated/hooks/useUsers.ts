import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { UsersController_createUser, UsersController_getProfile, UsersController_getUser, UsersController_deleteUser, UsersController_updateName } from '../requests/users';
import type { ApiResponse } from '../../types';
import type { components } from '../types';

type CreateRedisUserDto = components['schemas']['CreateRedisUserDto'];
type RedisUserResponseDto = components['schemas']['RedisUserResponseDto'];
type UserProfileResponseDto = components['schemas']['UserProfileResponseDto'];

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'],
  UsersController_getUser: (path: { userId: string }) => ['users', 'UsersController_getUser', path.userId],
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
    mutationFn: async (data: { userId: string }) => {
      const { userId } = data;
      const response: ApiResponse<void> = await UsersController_deleteUser({ userId });
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
    mutationFn: async (data: { userId: string; name: string }) => {
      const { userId, name } = data;
      const response: ApiResponse<RedisUserResponseDto> = await UsersController_updateName({ userId }, { name });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
