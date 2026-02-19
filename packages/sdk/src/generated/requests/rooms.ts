import { api } from '../../client';
import type { ApiResponse } from '../../types';

/**
 * Create a new room
 * Creates a new room with a unique 6-digit public code and broadcasts the event via WebSocket. Requires authentication.
 * @param body - Request body
 * @returns any
 */
export async function RoomsController_createRoom(body: CreateRoomDto) {
  const url = `/rooms`;
  const fullUrl = url;
  
  const response = await api.post<any>(url, body);
  return response;
}


/**
 * Get current user rooms
 * Retrieves all rooms where the current user is a member. Requires authentication.
 * @returns RoomResponseDto[]
 */
export async function RoomsController_getMyRooms() {
  const url = `/rooms/my-rooms`;
  const fullUrl = url;
  
  const response = await api.get<RoomResponseDto[]>(url);
  return response;
}


/**
 * Get room by ID
 * Retrieves room data by room ID. Requires authentication.
 * @param params - Request parameters
 * @returns RoomResponseDto
 */
export async function RoomsController_getRoom(path: { id: string }) {
  const url = `/rooms/${id}`;
  const fullUrl = url;
  
  const response = await api.get<RoomResponseDto>(url);
  return response;
}


/**
 * Join a room by public code
 * Adds a user to a room using 6-digit public code and broadcasts the update via WebSocket. Requires authentication.
 * @param body - Request body
 * @returns RoomResponseDto
 */
export async function RoomsController_joinRoom(body: JoinRoomDto) {
  const url = `/rooms/join`;
  const fullUrl = url;
  
  const response = await api.post<RoomResponseDto>(url, body);
  return response;
}


/**
 * Leave a room
 * Removes a user from a room and broadcasts the update via WebSocket. Requires authentication.
 * @param params - Request parameters
 * @param body - Request body
 * @returns RoomResponseDto
 */
export async function RoomsController_leaveRoom(path: { id: string }, body: any) {
  const url = `/rooms/${id}/leave`;
  const fullUrl = url;
  
  const response = await api.post<RoomResponseDto>(url, body);
  return response;
}


/**
 * Choose a movie
 * Records a user's movie choice and broadcasts the update via WebSocket. Requires authentication.
 * @param params - Request parameters
 * @param body - Request body
 * @returns RoomResponseDto
 */
export async function RoomsController_chooseMovie(path: { id: string }, body: any) {
  const url = `/rooms/${id}/choice`;
  const fullUrl = url;
  
  const response = await api.post<RoomResponseDto>(url, body);
  return response;
}


/**
 * Get room members
 * Retrieves list of room members with their roles and names. Only room members can view this list. Requires authentication.
 * @param params - Request parameters
 * @returns RoomMembersResponseDto
 */
export async function RoomsController_getRoomMembers(path: { id: string }) {
  const url = `/rooms/${id}/members`;
  const fullUrl = url;
  
  const response = await api.get<RoomMembersResponseDto>(url);
  return response;
}


/**
 * Remove user from room
 * Removes a user from the room. Only the room creator can remove users. Requires authentication.
 * @param params - Request parameters
 * @returns RoomResponseDto
 */
export async function RoomsController_removeUserFromRoom(path: { id: string, userId: string }) {
  const url = `/rooms/${id}/members/${userId}`;
  const fullUrl = url;
  
  const response = await api.delete<RoomResponseDto>(url);
  return response;
}


/**
 * Get chat history (WebSocket recommended)
 * Retrieves chat history for a room. Note: Chat history is automatically sent via WebSocket when joining a room. This HTTP endpoint is provided for reference. Requires authentication and room membership.
 * @param params - Request parameters
 * @returns any
 */
export async function RoomsController_getChatHistory(path: { id: string }) {
  const url = `/rooms/${id}/chat/history`;
  const fullUrl = url;
  
  const response = await api.get<any>(url);
  return response;
}


/**
 * Mute a user in room chat
 * Mutes a user in the room chat for specified duration (1, 5, or 10 minutes). Only the room creator can mute users. Requires authentication.
 * @param params - Request parameters
 * @param body - Request body
 * @returns RoomResponseDto
 */
export async function RoomsController_muteUser(path: { id: string, userId: string }, body: any) {
  const url = `/rooms/${id}/members/${userId}/mute`;
  const fullUrl = url;
  
  const response = await api.post<RoomResponseDto>(url, body);
  return response;
}


/**
 * Unmute a user in room chat
 * Removes mute from a user in the room chat. Only the room creator can unmute users. Requires authentication.
 * @param params - Request parameters
 * @returns RoomResponseDto
 */
export async function RoomsController_unmuteUser(path: { id: string, userId: string }) {
  const url = `/rooms/${id}/members/${userId}/mute`;
  const fullUrl = url;
  
  const response = await api.delete<RoomResponseDto>(url);
  return response;
}
