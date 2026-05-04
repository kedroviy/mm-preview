"use client";

import type { Room } from "@mm-preview/sdk";
import { roomKeys } from "@mm-preview/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  movieMatchCreateRoom,
  movieMatchGetMyMemberships,
  movieMatchGetRoomState,
  movieMatchJoinRoom,
  movieMatchLeaveMyRoom,
} from "../movie-match/api";
import {
  legacyRoomToDashboardRoom,
  membershipToDashboardRoom,
  mergeStateIntoRoom,
} from "../movie-match/map-room";

export function useMovieMatchMyRooms(enabled = true) {
  return useQuery({
    queryKey: roomKeys.myRooms(),
    queryFn: async () => {
      const list = await movieMatchGetMyMemberships();
      return list.map(membershipToDashboardRoom);
    },
    enabled,
  });
}

export function useMovieMatchCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const legacy = await movieMatchCreateRoom(userId);
      return legacyRoomToDashboardRoom(legacy, String(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() });
    },
  });
}

export function useMovieMatchJoinRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { publicCode: string; userId: string }) => {
      const uid = Number(input.userId);
      if (!Number.isFinite(uid)) {
        throw new Error("Некорректный userId");
      }
      const legacy = await movieMatchJoinRoom(input.publicCode, uid);
      return legacyRoomToDashboardRoom(legacy, input.userId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() });
    },
  });
}

export function useMovieMatchRoom(roomId: string, userId: string) {
  return useQuery({
    queryKey: [...roomKeys.detail(roomId), "movie-match", userId],
    queryFn: async (): Promise<Room> => {
      const memberships = await movieMatchGetMyMemberships();
      const m =
        memberships.find((x) => x.roomId === roomId) ??
        memberships.find((x) => x.roomKey === roomId);
      const key = m?.roomKey ?? roomId;
      let state: unknown = null;
      try {
        state = await movieMatchGetRoomState(key);
      } catch {
        state = null;
      }
      if (!m && !state) {
        throw new Error("Room not found");
      }
      const base = m
        ? membershipToDashboardRoom(m)
        : ({
            roomId,
            publicCode: key,
            createdBy: null,
            users: [],
            userRoles: {},
            choices: {},
            isMember: true,
            isCreator: false,
            canManage: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } satisfies Room);
      return mergeStateIntoRoom(base, state, userId);
    },
    enabled: !!roomId,
  });
}

export function useMovieMatchLeaveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomKey: string) => {
      await movieMatchLeaveMyRoom(roomKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() });
    },
  });
}
