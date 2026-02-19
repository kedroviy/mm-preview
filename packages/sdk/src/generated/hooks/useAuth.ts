import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { AuthController_login, AuthController_refreshToken, AuthController_logout } from '../requests/auth';
import type { ApiResponse } from '../../types';
import type { components } from '../types';

type LoginDto = components['schemas']['LoginDto'];
type LoginResponseDto = components['schemas']['LoginResponseDto'];
type RefreshTokenDto = components['schemas']['RefreshTokenDto'];
type AuthResponseDto = components['schemas']['AuthResponseDto'];

/**
 * Login by name
 */
export function useAuthController_login() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      
      const response: ApiResponse<LoginResponseDto> = await AuthController_login(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}


/**
 * Refresh access token
 */
export function useAuthController_refreshToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RefreshTokenDto) => {
      
      const response: ApiResponse<AuthResponseDto> = await AuthController_refreshToken(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}


/**
 * Logout user
 */
export function useAuthController_logout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      
      const response: ApiResponse<void> = await AuthController_logout();
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
