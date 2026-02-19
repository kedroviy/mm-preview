import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { RoomsController_createRoom, RoomsController_getMyRooms, RoomsController_getRoom, RoomsController_joinRoom, RoomsController_leaveRoom, RoomsController_chooseMovie, RoomsController_getRoomMembers, RoomsController_removeUserFromRoom, RoomsController_getChatHistory, RoomsController_muteUser, RoomsController_unmuteUser } from '../requests/rooms';
import type { ApiResponse } from '../../types';
import type { components } from '../types';

type CreateRoomDto = components['schemas']['CreateRoomDto'];
type JoinRoomDto = components['schemas']['JoinRoomDto'];
type RoomResponseDto = components['schemas']['RoomResponseDto'];
type RoomMembersResponseDto = components['schemas']['RoomMembersResponseDto'];

type LeaveRoomBody = { userId: string };
type ChooseMovieBody = { userId: string; movieId: string };
type MuteUserBody = { durationMinutes: 1 | 5 | 10 };
type ChatHistoryResponse = {
  roomId?: string;
  messages?: Array<{
    id?: string;
    roomId?: string;
    userId?: string;
    userName?: string;
    message?: string;
    createdAt?: number;
  }>;
};

export const roomsKeys = {
  RoomsController_getMyRooms: () => ['rooms', 'RoomsController_getMyRooms'],
  RoomsController_getRoom: (path: { id: string }) => ['rooms', 'RoomsController_getRoom', path.id],
  RoomsController_getRoomMembers: (path: { id: string }) => ['rooms', 'RoomsController_getRoomMembers', path.id],
  RoomsController_getChatHistory: (path: { id: string }) => ['rooms', 'RoomsController_getChatHistory', path.id],
} as const;

/**
 * Create a new room
 */
export function useRoomsController_createRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateRoomDto) => {
      
      const response: ApiResponse<RoomResponseDto> = await RoomsController_createRoom(data);
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
export function useRoomsController_getMyRooms(options?: UseQueryOptions<RoomResponseDto[]>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getMyRooms(),
    queryFn: async () => {
      const response: ApiResponse<RoomResponseDto[]> = await RoomsController_getMyRooms();
      return response.data;
    },
    ...options,
  });
}


/**
 * Get room by ID
 */
export function useRoomsController_getRoom(path: { id: string }, options?: UseQueryOptions<RoomResponseDto>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getRoom(path),
    queryFn: async () => {
      const response: ApiResponse<RoomResponseDto> = await RoomsController_getRoom(path);
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
    mutationFn: async (data: JoinRoomDto) => {
      
      const response: ApiResponse<RoomResponseDto> = await RoomsController_joinRoom(data);
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
    mutationFn: async (data: { id: string; userId: string }) => {
      const { id, userId } = data;
      const response: ApiResponse<RoomResponseDto> = await RoomsController_leaveRoom({ id }, { userId });
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
    mutationFn: async (data: { id: string; userId: string; movieId: string }) => {
      const { id, userId, movieId } = data;
      const response: ApiResponse<RoomResponseDto> = await RoomsController_chooseMovie({ id }, { userId, movieId });
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
export function useRoomsController_getRoomMembers(path: { id: string }, options?: UseQueryOptions<RoomMembersResponseDto>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getRoomMembers(path),
    queryFn: async () => {
      const response: ApiResponse<RoomMembersResponseDto> = await RoomsController_getRoomMembers(path);
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
    mutationFn: async (data: { id: string; userId: string }) => {
      const { id, userId } = data;
      const response: ApiResponse<RoomResponseDto> = await RoomsController_removeUserFromRoom({ id, userId });
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
export function useRoomsController_getChatHistory(path: { id: string }, options?: UseQueryOptions<ChatHistoryResponse>) {
  return useQuery({
    queryKey: roomsKeys.RoomsController_getChatHistory(path),
    queryFn: async () => {
      const response: ApiResponse<ChatHistoryResponse> = await RoomsController_getChatHistory(path);
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
    mutationFn: async (data: { id: string; userId: string; durationMinutes: 1 | 5 | 10 }) => {
      const { id, userId, durationMinutes } = data;
      const response: ApiResponse<RoomResponseDto> = await RoomsController_muteUser({ id, userId }, { durationMinutes });
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
    mutationFn: async (data: { id: string; userId: string }) => {
      const { id, userId } = data;
      const response: ApiResponse<RoomResponseDto> = await RoomsController_unmuteUser({ id, userId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
