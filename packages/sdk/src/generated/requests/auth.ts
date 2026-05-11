import { api } from '../../client';

/**
 * Login by name
 * Logs in a user by name. Creates a new user with unique ID if needed. No uniqueness check - multiple users can have the same name. Sets JWT tokens in cookies.
 * @param body - Request body
 * @returns any
 */
export async function AuthController_login(body: any) {
  const url = `/api/v1/auth/login`;
  const fullUrl = url;
  
  const response = await api.post<any>(url, body);
  return response;
}


/**
 * POST /api/v1/auth/refresh
 * @returns any
 */
export async function AuthController_refreshToken() {
  const url = `/api/v1/auth/refresh`;
  const fullUrl = url;
  
  const response = await api.post<any>(url);
  return response;
}


/**
 * Logout user
 * Revokes the current refresh token and clears authentication cookies.
 * @returns any
 */
export async function AuthController_logout() {
  const url = `/api/v1/auth/logout`;
  const fullUrl = url;
  
  const response = await api.post<any>(url);
  return response;
}


/**
 * Admin login by email
 * Authenticates admin and sets JWT tokens in secure cookies.
 * @param body - Request body
 * @returns any
 */
export async function AuthController_adminLogin(body: any) {
  const url = `/api/v1/auth/admin/login`;
  const fullUrl = url;
  
  const response = await api.post<any>(url, body);
  return response;
}
