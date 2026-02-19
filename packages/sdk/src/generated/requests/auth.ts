import { api } from '../../client';
import type { ApiResponse } from '../../types';

/**
 * Login by name
 * Logs in a user by name. Creates a new user with unique ID if needed. No uniqueness check - multiple users can have the same name. Sets JWT tokens in cookies.
 * @param body - Request body
 * @returns LoginResponseDto
 */
export async function AuthController_login(body: LoginDto) {
  const url = `/auth/login`;
  const fullUrl = url;
  
  const response = await api.post<LoginResponseDto>(url, body);
  return response;
}


/**
 * Refresh access token
 * Generates a new access token using a valid refresh token. Refresh token is read from HTTP-only cookie (refresh_token). If cookie is not available, token can be provided in request body (for testing only).
 * @param body - Request body
 * @returns AuthResponseDto
 */
export async function AuthController_refreshToken(body: RefreshTokenDto) {
  const url = `/auth/refresh`;
  const fullUrl = url;
  
  const response = await api.post<AuthResponseDto>(url, body);
  return response;
}


/**
 * Logout user
 * Revokes the current refresh token and clears authentication cookies.
 * @returns any
 */
export async function AuthController_logout() {
  const url = `/auth/logout`;
  const fullUrl = url;
  
  const response = await api.post<any>(url);
  return response;
}
