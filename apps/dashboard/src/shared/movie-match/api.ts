"use client";

import { movieMatchFetch } from "./http";
import type { LegacyRoom, UserRoomMembership } from "./types";

export async function movieMatchCreateRoom(
  userId: number,
): Promise<LegacyRoom> {
  return movieMatchFetch<LegacyRoom>("/rooms/create", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function movieMatchJoinRoom(
  key: string,
  userId: number,
): Promise<LegacyRoom> {
  return movieMatchFetch<LegacyRoom>(`/rooms/join/${encodeURIComponent(key)}`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function movieMatchLeaveMyRoom(
  roomKey: string,
): Promise<{ message: string }> {
  return movieMatchFetch<{ message: string }>("/rooms/my/leave", {
    method: "POST",
    body: JSON.stringify({ roomKey }),
  });
}

export async function movieMatchGetMyMemberships(): Promise<
  UserRoomMembership[]
> {
  return movieMatchFetch<UserRoomMembership[]>("/rooms/my/memberships", {
    method: "GET",
  });
}

/** Агрегат комнаты — как `getRoomState` в movieMatcher. */
export async function movieMatchGetRoomState(
  roomKey: string,
): Promise<unknown> {
  return movieMatchFetch<unknown>(
    `/rooms/${encodeURIComponent(roomKey)}/state`,
    {
      method: "GET",
    },
  );
}
