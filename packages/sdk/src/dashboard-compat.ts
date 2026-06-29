/**
 * Dashboard-facing wrappers on top of generated OpenAPI hooks.
 * Keeps app imports stable when Orval names change.
 */

import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
	getRoomsControllerGetMyRoomMembershipsQueryKey,
	getRoomsControllerGetNextMovieQueryKey,
	getRoomsControllerGetRoomStateQueryKey,
	roomsControllerCreateRoom,
	roomsControllerGetRoomState,
	useRoomsControllerGetMyRoomMemberships,
	useRoomsControllerGetRoomState,
	useUserControllerGetMe,
} from "./generated/orval/api";
import type { CreateRoomDto } from "./generated/orval/models/createRoomDto";
import type { LikeMovieDto } from "./generated/orval/models/likeMovieDto";
import type { UpdateUserStatusDto } from "./generated/orval/models/updateUserStatusDto";
import type { UserControllerGetMeParams } from "./generated/orval/models/userControllerGetMeParams";
import type { RoomParticipantStateDto } from "./generated/orval/models/roomParticipantStateDto";
import type { RoomStateDto } from "./generated/orval/models/roomStateDto";
import type { UserRoomMembershipDto } from "./generated/orval/models/userRoomMembershipDto";
import { UserRoomMembershipDtoRole } from "./generated/orval/models/userRoomMembershipDtoRole";
import {
	checkStatus,
	getMovieData,
	joinRoomService,
	leaveRoomService,
	postLikeMovie,
	startMatchService,
	updateRoomFilters,
	updateUserStatus,
} from "./match-api";
import { getAccessToken, getUserIdFromToken } from "./runtime/auth-tokens";
import type {
	MatchPhase,
	MatchUserStatus,
	Room,
	RoomMember,
	RoomParticipant,
	RoomRole,
	RoomStatus,
} from "./types/dashboard-app";

export type {
	ChatMessage,
	MatchPhase,
	MatchUserStatus,
	Room,
	RoomDeckSummary,
	RoomMember,
	RoomParticipant,
	RoomRole,
	RoomStatus,
} from "./types/dashboard-app";

export type { LikeMovieDto } from "./generated/orval/models/likeMovieDto";
export type { Movie } from "./generated/orval/models/movie";
export type { MoviesResponse } from "./generated/orval/models/moviesResponse";

const ME_PARAMS_PLACEHOLDER = {
	userEmail: undefined,
} as unknown as UserControllerGetMeParams;

export const roomKeys = {
	all: ["rooms"] as const,
	myRooms: () => [...roomKeys.all, "my"] as const,
	detail: (roomId: string) => [...roomKeys.all, "detail", roomId] as const,
};

export const roomMoviesQueryKey = (roomKey: string) =>
	getRoomsControllerGetNextMovieQueryKey(roomKey);

function mapUserStatus(status: string): MatchUserStatus {
	const upper = status.toUpperCase();
	if (upper === "WAITING") return "WAITING";
	if (upper === "CLOSED") return "CLOSED";
	return "ACTIVE";
}

function mapParticipant(p: RoomParticipantStateDto): RoomParticipant {
	return {
		userId: String(p.userId),
		name: p.userName,
		role: p.role,
		userStatus: mapUserStatus(p.userStatus),
		likedCount: p.likedCount,
	};
}

function mapParticipantRole(role: string): RoomRole {
	const r = role.toLowerCase();
	if (r.includes("author") || r === "admin") return "room_creator";
	return "room_member";
}

function isAdminRole(role: string): boolean {
	const r = role.toLowerCase();
	return r === "admin" || r.includes("author");
}

/** Whether the user can start match / edit filters (same as movieMatcher admin). */
export function isRoomAdmin(room: Room, userId?: string | null): boolean {
	if (!userId) return false;
	if (room.canManage || room.isCreator) return true;
	const participant = room.participants?.find((p) => p.userId === userId);
	return participant ? isAdminRole(participant.role) : false;
}

function mapStateToRoom(
	state: RoomStateDto,
	currentUserId: string | null,
	membership?: UserRoomMembershipDto,
): Room {
	const users = state.participants.map((p) => String(p.userId));
	const userRoles: Record<string, RoomRole> = {};
	for (const p of state.participants) {
		userRoles[String(p.userId)] = mapParticipantRole(p.role);
	}
	const self: RoomParticipantStateDto | undefined = currentUserId
		? state.participants.find((p) => String(p.userId) === currentUserId)
		: undefined;
	const isMember = !!self || !!membership;
	const isAdmin =
		(!!self && isAdminRole(self.role)) || !!membership?.isAuthor;
	return {
		roomId: String(state.roomId),
		publicCode: state.roomKey,
		createdBy: null,
		users,
		userRoles,
		choices: {},
		isMember,
		isCreator: isAdmin,
		canManage: isAdmin,
		currentUserRole: self ? mapParticipantRole(self.role) : undefined,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		matchPhase: state.matchPhase as MatchPhase,
		roomStatus: state.roomStatus as RoomStatus,
		aggregateVersion: state.aggregateVersion,
		participants: state.participants.map(mapParticipant),
		deck: state.deck,
		hasFilters: state.hasFilters,
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

/** Room keys are 6-digit public codes; route ids are numeric DB ids. */
const ROOM_PUBLIC_CODE_PATTERN = /^\d{6}$/;

function resolveRoomKey(
	list: UserRoomMembershipDto[] | undefined,
	roomRouteId: string,
	isMembershipsLoading: boolean,
): string | null {
	if (ROOM_PUBLIC_CODE_PATTERN.test(roomRouteId)) {
		return roomRouteId;
	}
	if (isMembershipsLoading) {
		return null;
	}
	const hit = list?.find(
		(r) => r.roomId === roomRouteId || r.roomKey === roomRouteId,
	);
	return hit?.roomKey ?? null;
}

function seedRoomCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	state: RoomStateDto,
	role: UserRoomMembershipDtoRole,
	isAuthor: boolean,
): void {
	queryClient.setQueryData(
		getRoomsControllerGetRoomStateQueryKey(state.roomKey),
		state,
	);
	queryClient.setQueryData<UserRoomMembershipDto[]>(
		getRoomsControllerGetMyRoomMembershipsQueryKey(),
		(prev) => {
			const entry: UserRoomMembershipDto = {
				roomKey: state.roomKey,
				roomId: String(state.roomId),
				role,
				isAuthor,
				userStatus: "ACTIVE",
				matchPhase: state.matchPhase,
				roomStatus: state.roomStatus,
				roomName: null,
			};
			const rest = (prev ?? []).filter(
				(m) => m.roomId !== entry.roomId && m.roomKey !== entry.roomKey,
			);
			return [entry, ...rest];
		},
	);
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
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (vars?: { name?: string }) => {
			const body: CreateRoomDto = {
				name: vars?.name?.trim() || "Комната",
				filters: {},
			};
			const created = await roomsControllerCreateRoom(body);
			if (!created.roomKey) {
				throw new Error("Create room response missing roomKey");
			}
			const state = await roomsControllerGetRoomState(created.roomKey);
			seedRoomCaches(
				queryClient,
				state,
				UserRoomMembershipDtoRole.admin,
				true,
			);
			return {
				roomId: String(state.roomId),
				publicCode: state.roomKey,
			};
		},
	});
}

export function useJoinRoom() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (vars: { key: string; userId: number }) => {
			await joinRoomService(vars.key, vars.userId);
			const uid = String(vars.userId);
			const state = await roomsControllerGetRoomState(vars.key);
			const isAuthor = state.participants.some(
				(p) => String(p.userId) === uid && isAdminRole(p.role),
			);
			seedRoomCaches(
				queryClient,
				state,
				isAuthor
					? UserRoomMembershipDtoRole.admin
					: UserRoomMembershipDtoRole.participant,
				isAuthor,
			);
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
		() =>
			resolveRoomKey(
				listQuery.data,
				roomRouteId,
				listQuery.isPending,
			),
		[listQuery.data, roomRouteId, listQuery.isPending],
	);

	const stateQuery = useRoomsControllerGetRoomState(resolvedKey ?? "", {
		query: {
			enabled: !!resolvedKey,
			queryKey: resolvedKey
				? getRoomsControllerGetRoomStateQueryKey(resolvedKey)
				: getRoomsControllerGetRoomStateQueryKey("__pending__"),
		},
	});

	const membership = useMemo(
		() =>
			listQuery.data?.find(
				(m) =>
					m.roomKey === resolvedKey ||
					m.roomId === roomRouteId ||
					m.roomKey === roomRouteId,
			),
		[listQuery.data, resolvedKey, roomRouteId],
	);

	const data = useMemo(() => {
		if (!stateQuery.data) return undefined;
		return mapStateToRoom(stateQuery.data, currentUserId, membership);
	}, [stateQuery.data, currentUserId, membership]);

	const isResolvingKey = listQuery.isPending || (!resolvedKey && !listQuery.isFetched);

	return {
		...stateQuery,
		data,
		isPending: stateQuery.isPending || isResolvingKey,
		isLoading: stateQuery.isPending || isResolvingKey,
	};
}

export function useRoomMembers(roomRouteId: string) {
	const listQuery = useRoomsControllerGetMyRoomMemberships();
	const resolvedKey = useMemo(
		() =>
			resolveRoomKey(
				listQuery.data,
				roomRouteId,
				listQuery.isPending,
			),
		[listQuery.data, roomRouteId, listQuery.isPending],
	);
	const stateQuery = useRoomsControllerGetRoomState(resolvedKey ?? "", {
		query: {
			enabled: !!resolvedKey,
			queryKey: resolvedKey
				? getRoomsControllerGetRoomStateQueryKey(resolvedKey)
				: getRoomsControllerGetRoomStateQueryKey("__pending__"),
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
		mutationFn: (vars: { roomKey: string; userId: number }) =>
			leaveRoomService(vars.roomKey, vars.userId),
	});
}

/** Movie deck for a room (Kinopoisk-shaped docs array). */
export function useRoomMovies(
	roomKey: string | undefined,
	options?: { enabled?: boolean },
) {
	const enabled = (options?.enabled ?? true) && !!roomKey;
	return useQuery({
		queryKey: roomMoviesQueryKey(roomKey ?? ""),
		queryFn: async () => {
			if (!roomKey) {
				throw new Error("roomKey required");
			}
			return getMovieData(roomKey);
		},
		enabled,
	});
}

export function useStartMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (vars: { roomKey: string }) => {
			await startMatchService(vars.roomKey);
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: getRoomsControllerGetRoomStateQueryKey(vars.roomKey),
			});
			queryClient.invalidateQueries({
				queryKey: roomMoviesQueryKey(vars.roomKey),
			});
		},
	});
}

export function useLikeMovie() {
	return useMutation({
		mutationFn: (data: LikeMovieDto) => postLikeMovie(data),
	});
}

export function useUpdateMatchUserStatus() {
	return useMutation({
		mutationFn: (data: UpdateUserStatusDto) => updateUserStatus(data),
	});
}

export function useCheckMatchStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (vars: {
			roomKey: string;
			userId: number;
			idempotencyKey?: string;
		}) => {
			await checkStatus(vars.roomKey, vars.userId, vars.idempotencyKey);
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: getRoomsControllerGetRoomStateQueryKey(vars.roomKey),
			});
			queryClient.invalidateQueries({
				queryKey: roomMoviesQueryKey(vars.roomKey),
			});
		},
	});
}

export type RoomFiltersPayload = {
	selectedCountries?: { id: string | number; label: string }[];
	selectedGenres?: { id: string | number; label: string }[];
	selectedYears?: { id: string | number; label: string }[];
	excludeGenre?: { id: string | number; label: string }[];
	selectedRating?: [number, number];
};

export function useUpdateRoomFilters() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (vars: {
			roomId: string;
			roomKey: string;
			filters: RoomFiltersPayload;
		}) => {
			await updateRoomFilters(vars.roomId, vars.filters);
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: getRoomsControllerGetRoomStateQueryKey(vars.roomKey),
			});
		},
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
