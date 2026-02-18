import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateRoomRequest,
  type JoinRoomRequest,
  roomsApi,
} from "../services/rooms";

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: roomKeys.detail(roomId),
    queryFn: async () => {
      const response = await roomsApi.getRoom(roomId);
      return response.data;
    },
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: CreateRoomRequest) => {
      const response = await roomsApi.createRoom(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JoinRoomRequest) => {
      const response = await roomsApi.joinRoom(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) => {
      const response = await roomsApi.leaveRoom(roomId, { userId });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useChooseMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      userId,
      movieId,
    }: {
      roomId: string;
      userId: string;
      movieId: string;
    }) => {
      const response = await roomsApi.chooseMovie(roomId, { userId, movieId });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
    },
  });
}

export function useRoomMembers(roomId: string) {
  return useQuery({
    queryKey: [...roomKeys.detail(roomId), "members"],
    queryFn: async () => {
      const response = await roomsApi.getRoomMembers(roomId);
      return response.data.members;
    },
    enabled: !!roomId,
  });
}

export function useRemoveUserFromRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) => {
      const response = await roomsApi.removeUserFromRoom(roomId, userId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
      queryClient.invalidateQueries({
        queryKey: [...roomKeys.detail(data.roomId), "members"],
      });
    },
  });
}

export function useChatHistory(roomId: string) {
  return useQuery({
    queryKey: [...roomKeys.detail(roomId), "chat"],
    queryFn: async () => {
      const response = await roomsApi.getChatHistory(roomId);
      return response.data.messages;
    },
    enabled: !!roomId,
  });
}
