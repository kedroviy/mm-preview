/**
 * REST helpers aligned with movieMatcher `features/match/match-service.ts`.
 * Bearer token is attached by `axiosInstance` interceptors (same as mobile `createApi`).
 */

import { axiosInstance } from "./orval-mutator";
import type { LikeMovieDto } from "./generated/orval/models/likeMovieDto";
import type { MoviesResponse } from "./generated/orval/models/moviesResponse";
import type { UpdateUserStatusDto } from "./generated/orval/models/updateUserStatusDto";

export async function joinRoomService(
	key: string,
	userId: number,
): Promise<void> {
	await axiosInstance.post(`/rooms/join/${key}`, { userId });
}

export async function leaveRoomService(
	key: string,
	userId: number,
): Promise<void> {
	await axiosInstance.post(`/rooms/leave/${key}`, { userId });
}

export async function startMatchService(key: string): Promise<void> {
	await axiosInstance.post(`/rooms/${key}/start-match`);
}

export async function getMovieData(roomKey: string): Promise<MoviesResponse> {
	const raw = await axiosInstance.get<unknown>(
		`/rooms/${roomKey}/get-movies`,
	);
	return parseMoviesPayload(raw);
}

export async function postLikeMovie(like: LikeMovieDto): Promise<void> {
	await axiosInstance.post("/match/like", like);
}

export async function updateUserStatus(
	userStatus: UpdateUserStatusDto,
): Promise<void> {
	await axiosInstance.patch("/match/user-status", userStatus);
}

export async function checkStatus(
	roomKey: string,
	userId: number,
	idempotencyKey?: string,
): Promise<void> {
	const body: { userId: number; idempotencyKey?: string } = { userId };
	if (idempotencyKey) {
		body.idempotencyKey = idempotencyKey;
	}
	await axiosInstance.post(`/match/check-status/${roomKey}`, body);
}

export async function updateRoomFilters(
	roomId: string,
	filters: Record<string, unknown>,
): Promise<void> {
	await axiosInstance.put(`/rooms/${roomId}/filters`, filters);
}

function parseMoviesPayload(raw: unknown): MoviesResponse {
	if (typeof raw === "string") {
		return JSON.parse(raw) as MoviesResponse;
	}
	if (raw && typeof raw === "object" && "docs" in raw) {
		return raw as MoviesResponse;
	}
	if (
		raw &&
		typeof raw === "object" &&
		"data" in raw &&
		typeof (raw as { data: unknown }).data === "object"
	) {
		return (raw as { data: MoviesResponse }).data;
	}
	return { docs: [], total: 0, limit: 0, page: 0, pages: 0 };
}
