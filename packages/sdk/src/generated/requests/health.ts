import { api } from '../../client';
import type { ApiResponse } from '../../types';

/**
 * Health check endpoint
 * @returns any
 */
export async function AppController_getHello() {
  const url = `/`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}


/**
 * Health check for monitoring
 * @returns any
 */
export async function AppController_healthCheck() {
  const url = `/health`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}
