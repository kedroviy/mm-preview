import { api } from '../../client';

/**
 * Health check endpoint
 * @returns any
 */
export async function AppController_getHello() {
  const url = `/api/v1`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}


/**
 * Health check for monitoring
 * @returns any
 */
export async function AppController_healthCheck() {
  const url = `/api/v1/health`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}
