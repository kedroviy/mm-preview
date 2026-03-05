import { api } from '../../client';

/**
 * Create a new user
 * Creates a new user in PostgreSQL and sets JWT token in cookie. If userId is not provided, a new UUID will be generated.
 * @param body - Request body
 * @returns any
 */
export async function UsersController_createUser(body: any) {
  const url = `/api/v1/users`;
  const fullUrl = url;
  
  const response = await api.post<any>(url, body);
  return response;
}


/**
 * Get current user profile
 * Retrieves the profile of the authenticated user (userId from JWT token) with their rooms. Requires authentication.
 * @returns any
 */
export async function UsersController_getProfile() {
  const url = `/api/v1/users/profile`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}


/**
 * Get user by ID (admin only)
 * Retrieves a user by their userId (UUID). Requires authentication. Only admins can view other users' data.
 * @param params - Request parameters
 * @returns any
 */
export async function UsersController_getUser(path: { userId: string }) {
  const url = `/api/v1/users/${path.userId}`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}


/**
 * Delete user
 * Deletes a user by their userId (UUID). Requires authentication. Users can only delete themselves unless they are admin.
 * @param params - Request parameters
 * @returns any
 */
export async function UsersController_deleteUser(path: { userId: string }) {
  const url = `/api/v1/users/${path.userId}`;
  const fullUrl = url;
  
  const response = await api.delete<any>(url);
  return response;
}


/**
 * Update user name
 * Updates the name of an existing user. Requires authentication. Users can only update their own name unless they are admin.
 * @param params - Request parameters
 * @param body - Request body
 * @returns any
 */
export async function UsersController_updateName(path: { userId: string }, body: any) {
  const url = `/api/v1/users/${path.userId}/name`;
  const fullUrl = url;
  
  const response = await api.patch<any>(url, body);
  return response;
}
