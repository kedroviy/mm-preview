/**
 * Dashboard-facing wrappers on top of generated OpenAPI hooks.
 * Keeps app imports stable when Orval names change.
 */

import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	getRoomsControllerGetRoomStateQueryKey,
	roomsControllerCreateRoom,
	roomsControllerGetRoomState,
	roomsControllerJoinRoom,
	roomsControllerLeaveRoom,
	useRoomsControllerGetMyRoomMemberships,
	useRoomsControllerGetRoomState,
	useUserControllerGetMe,
} from "./generated/orval/api";
import type { CreateRoomDto } from "./generated/orval/models/createRoomDto";
import type { UserControllerGetMeParams } from "./generated/orval/models/userControllerGetMeParams";
import type { RoomParticipantStateDto } from "./generated/orval/models/roomParticipantStateDto";
import type { RoomStateDto } from "./generated/orval/models/roomStateDto";
import type { UserRoomMembershipDto } from "./generated/orval/models/userRoomMembershipDto";
import { getAccessToken, getUserIdFromToken } from "./runtime/auth-tokens";
import type {
	Room,
	RoomMember,
	RoomRole,
} from "./types/dashboard-app";

export type {
	ChatMessage,
	Room,
	RoomMember,
	RoomRole,
} from "./types/dashboard-app";

const ME_PARAMS_PLACEHOLDER = {
	userEmail: undefined,
} as unknown as UserControllerGetMeParams;

export const roomKeys = {
	all: ["rooms"] as const,
	myRooms: () => [...roomKeys.all, "my"] as const,
	detail: (roomId: string) => [...roomKeys.all, "detail", roomId] as const,
};

function mapParticipantRole(role: string): RoomRole {
	const r = role.toLowerCase();
	if (r.includes("author") || r === "admin") return "room_creator";
	return "room_member";
}

function mapStateToRoom(
	state: RoomStateDto,
	currentUserId: string | null,
): Room {
	const users = state.participants.map((p) => String(p.userId));
	const userRoles: Record<string, RoomRole> = {};
	for (const p of state.participants) {
		userRoles[String(p.userId)] = mapParticipantRole(p.role);
	}
	const self: RoomParticipantStateDto | undefined = currentUserId
		? state.participants.find((p) => String(p.userId) === currentUserId)
		: undefined;
	const isMember = !!self;
	const creatorLike =
		self &&
		(self.role.toLowerCase().includes("author") ||
			self.role.toLowerCase() === "admin");
	return {
		roomId: state.roomId,
		publicCode: state.roomKey,
		createdBy: null,
		users,
		userRoles,
		choices: {},
		isMember,
		isCreator: !!creatorLike,
		canManage: !!creatorLike,
		currentUserRole: self ? mapParticipantRole(self.role) : undefined,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
}

function mapMembershipToRoom(m: UserRoomMembershipDto): Room {
	const role: RoomRole = m.isAuthor ? "room_creator" : "room_member";
	return {
		roomId: m.roomId,
		publicCode: m.roomKey,
		createdBy: null,
		users: [],
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

function resolveRoomKey(
	list: UserRoomMembershipDto[] | undefined,
	roomRouteId: string,
): string {
	if (!list?.length) return roomRouteId;
	const hit = list.find(
		(r) => r.roomId === roomRouteId || r.roomKey === roomRouteId,
	);
	return hit?.roomKey ?? roomRouteId;
}

/** My rooms list for the rooms table (matches legacy SDK shape). */
export function useMyRooms(options?: { enabled?: boolean }) {
	const q = useRoomsControllerGetMyRoomMemberships({
		query: {
			enabled: options?.enabled ?? true,
		},
	});
	const data = useMemo(
		() => q.data?.map(mapMembershipToRoom),
		[q.data],
	);
	return {
		...q,
		data,
		isLoading: q.isPending,
	};
}

export function useCreateRoom() {
	return useMutation({
		mutationFn: async (vars?: { name?: string }) => {
			const body: CreateRoomDto = {
				name: vars?.name?.trim() || "Комната",
				filters: {},
			};
			const created = await roomsControllerCreateRoom(body);
			const state = await roomsControllerGetRoomState(created.roomKey);
			return {
				roomId: state.roomId,
				publicCode: state.roomKey,
			};
		},
	});
}

export function useJoinRoom() {
	return useMutation({
		mutationFn: async (vars: { publicCode: string }) => {
			await roomsControllerJoinRoom(vars.publicCode);
			const state = await roomsControllerGetRoomState(vars.publicCode);
			const token =
				typeof document !== "undefined" ? getAccessToken() : null;
			const uid = getUserIdFromToken(token);
			return mapStateToRoom(state, uid);
		},
	});
}

export function useRoom(roomRouteId: string) {
	const listQuery = useRoomsControllerGetMyRoomMemberships();
	const token =
		typeof document !== "undefined" ? getAccessToken() : null;
	const currentUserId = getUserIdFromToken(token);

	const resolvedKey = useMemo(
		() => resolveRoomKey(listQuery.data, roomRouteId),
		[listQuery.data, roomRouteId],
	);

	const stateQuery = useRoomsControllerGetRoomState(resolvedKey, {
		query: {
			enabled: !!resolvedKey,
			queryKey: getRoomsControllerGetRoomStateQueryKey(resolvedKey),
		},
	});

	const data = useMemo(() => {
		if (!stateQuery.data) return undefined;
		return mapStateToRoom(stateQuery.data, currentUserId);
	}, [stateQuery.data, currentUserId]);

	return {
		...stateQuery,
		data,
	};
}

export function useRoomMembers(roomRouteId: string) {
	const listQuery = useRoomsControllerGetMyRoomMemberships();
	const resolvedKey = useMemo(
		() => resolveRoomKey(listQuery.data, roomRouteId),
		[listQuery.data, roomRouteId],
	);
	const stateQuery = useRoomsControllerGetRoomState(resolvedKey, {
		query: {
			enabled: !!resolvedKey,
			queryKey: getRoomsControllerGetRoomStateQueryKey(resolvedKey),
		},
	});
	const data = useMemo((): RoomMember[] | undefined => {
		if (!stateQuery.data) return undefined;
		return stateQuery.data.participants.map((p) => ({
			userId: String(p.userId),
			name: p.userName,
		}));
	}, [stateQuery.data]);
	return { ...stateQuery, data };
}

export function useLeaveRoom() {
	return useMutation({
		mutationFn: (vars: { roomId: string; roomKey: string }) =>
			roomsControllerLeaveRoom(vars.roomKey),
	});
}

type ProfileRow = {
	userId: string;
	name: string;
	role?: string;
	lastActive?: number;
	recentRooms?: string[];
	rooms?: Room[];
};

export function useUsersController_getProfile(
	query?: { enabled?: boolean },
) {
	return useUserControllerGetMe(ME_PARAMS_PLACEHOLDER, {
		query: {
			enabled: query?.enabled ?? true,
			select: (data): ProfileRow => ({
				userId: String(data.id),
				name: data.username,
			}),
		},
	});
}
