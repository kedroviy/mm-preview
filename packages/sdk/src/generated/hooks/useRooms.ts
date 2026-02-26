import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { RoomsController_createRoom, RoomsController_getMyRooms, RoomsController_getRoom, RoomsController_joinRoom, RoomsController_leaveRoom, RoomsController_chooseMovie, RoomsController_getRoomMembers, RoomsController_removeUserFromRoom, RoomsController_getChatHistory, RoomsController_muteUser, RoomsController_unmuteUser } from '../requests/rooms';
import type { ApiResponse } from '../../types';

export const roomsKeys = {
  RoomsController_getMyRooms: () => ['rooms', 'RoomsController_getMyRooms'],
  RoomsController_getRoom: (id: string) => ['rooms', 'RoomsController_getRoom', ...Object.values({ id })],
  RoomsController_getRoomMembers: (id: string) => ['rooms', 'RoomsController_getRoomMembers', ...Object.values({ id })],
  RoomsController_getChatHistory: (id: string) => ['rooms', 'RoomsController_getChatHistory', ...Object.values({ id })],
} as const;

/**
 * Create a new room
 */
export function useRoomsController_createRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      
      const response: ApiResponse<any> = await RoomsController_createRoom(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}


/**
 * Get current user rooms
 */
export function useRoomsController_getMyRooms(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getMyRooms(),
    queryFn: async () => {
      const response: ApiResponse<any> = await RoomsController_getMyRooms();
      return response.data;
    },
    ...options,
  });
}


/**
 * Get room by ID
 */
export function useRoomsController_getRoom(path: { id: string }, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getRoom(path),
    queryFn: async () => {
      const response: ApiResponse<any> = await RoomsController_getRoom(path);
      return response.data;
    },
    ...options,
  });
}


/**
 * Join a room by public code
 */
export function useRoomsController_joinRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      
      const response: ApiResponse<any> = await RoomsController_joinRoom(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}


/**
 * Leave a room
 */
export function useRoomsController_leaveRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { id, ...rest } = data as any;
      const response: ApiResponse<any> = await RoomsController_leaveRoom({ id }, rest);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}


/**
 * Choose a movie
 */
export function useRoomsController_chooseMovie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { id, ...rest } = data as any;
      const response: ApiResponse<any> = await RoomsController_chooseMovie({ id }, rest);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}


/**
 * Get room members
 */
export function useRoomsController_getRoomMembers(path: { id: string }, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getRoomMembers(path),
    queryFn: async () => {
      const response: ApiResponse<any> = await RoomsController_getRoomMembers(path);
      return response.data;
    },
    ...options,
  });
}


/**
 * Remove user from room
 */
export function useRoomsController_removeUserFromRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { id, userId, ...rest } = data as any;
      const response: ApiResponse<any> = await RoomsController_removeUserFromRoom({ id, userId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}


/**
 * Get chat history (WebSocket recommended)
 */
export function useRoomsController_getChatHistory(path: { id: string }, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getChatHistory(path),
    queryFn: async () => {
      const response: ApiResponse<any> = await RoomsController_getChatHistory(path);
      return response.data;
    },
    ...options,
  });
}


/**
 * Mute a user in room chat
 */
export function useRoomsController_muteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { id, userId, ...rest } = data as any;
      const response: ApiResponse<any> = await RoomsController_muteUser({ id, userId }, rest);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}


/**
 * Unmute a user in room chat
 */
export function useRoomsController_unmuteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { id, userId, ...rest } = data as any;
      const response: ApiResponse<any> = await RoomsController_unmuteUser({ id, userId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
