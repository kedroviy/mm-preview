import type { Room, RoomRole } from "@mm-preview/sdk";
import type { LegacyRoom, UserRoomMembership } from "./types";

function participantCountFromState(state: unknown): number {
  if (!state || typeof state !== "object") return 0;
  const s = state as Record<string, unknown>;
  const participants = s.participants ?? s.users ?? s.members;
  if (Array.isArray(participants)) return participants.length;
  return 0;
}

/** Список «мои комнаты» из memberships — совместимо с таблицей dashboard. */
export function membershipToDashboardRoom(m: UserRoomMembership): Room {
  const role: RoomRole = m.isAuthor ? "room_creator" : "room_member";
  const userIds: string[] = [];
  return {
    roomId: m.roomId,
    publicCode: m.roomKey,
    createdBy: null,
    users: userIds,
    userRoles: {},
    choices: {},
    isMember: true,
    isCreator: m.isAuthor,
    canManage: m.isAuthor,
    currentUserRole: role,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function legacyRoomToDashboardRoom(
  room: LegacyRoom,
  currentUserId?: string,
): Room {
  const users = (room.users ?? []).map((u) => String(u.id));
  const creatorId = room.authorId ? String(room.authorId) : undefined;
  const userRoles: Record<string, RoomRole> = {};
  for (const id of users) {
    userRoles[id] = id === creatorId ? "room_creator" : "room_member";
  }
  const created = room.createdAt
    ? new Date(room.createdAt).getTime()
    : Date.now();
  const uid = currentUserId?.trim();
  const isCreator = Boolean(uid && creatorId && creatorId === uid);
  return {
    roomId: room.id,
    publicCode: room.key,
    createdBy: creatorId ?? null,
    users,
    userRoles,
    choices: {},
    isMember: true,
    isCreator,
    canManage: isCreator,
    currentUserRole: isCreator ? "room_creator" : "room_member",
    createdAt: created,
    updatedAt: created,
  };
}

export function mergeStateIntoRoom(
  room: Room,
  state: unknown,
  _currentUserId: string,
): Room {
  const count = participantCountFromState(state);
  const users =
    count > 0 ? Array.from({ length: count }, (_, i) => `u${i}`) : room.users;
  return {
    ...room,
    users,
    isMember: true,
  };
}
