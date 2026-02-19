import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { AppController_getHello, AppController_healthCheck } from '../requests/health';
import type { ApiResponse } from '../types';

export const healthKeys = {
  AppController_getHello: () => ['health', 'AppController_getHello'],
  AppController_healthCheck: () => ['health', 'AppController_healthCheck'],
} as const;

/**
 * Health check endpoint
 */
export function useAppController_getHello(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: healthKeys.AppController_getHello(),
    queryFn: async () => {
      const response: ApiResponse<any> = await AppController_getHello();
      return response.data;
    },
    ...options,
  });
}


/**
 * Health check for monitoring
 */
export function useAppController_healthCheck(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: healthKeys.AppController_healthCheck(),
    queryFn: async () => {
      const response: ApiResponse<any> = await AppController_healthCheck();
      return response.data;
    },
    ...options,
  });
}
