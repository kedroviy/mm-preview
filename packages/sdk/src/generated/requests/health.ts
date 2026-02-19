import { api } from '../../client';
import type { ApiResponse } from '../../types';

/**
 * Health check endpoint
 * @returns void
 */
export async function AppController_getHello() {
  const url = `/`;
  const fullUrl = url;
  
  const response = await api.get<void>(url);
  return response;
}


/**
 * Health check for monitoring
 * @returns void
 */
export async function AppController_healthCheck() {
  const url = `/health`;
  const fullUrl = url;
  
  const response = await api.get<void>(url);
  return response;
}
