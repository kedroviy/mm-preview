"use client";

import {
	getAccessToken,
	getRoomsControllerGetRoomStateQueryKey,
	matchWebSocketService,
	roomMoviesQueryKey,
	type BroadcastMoviesPayload,
} from "@mm-preview/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type UseMatchWebSocketOptions = {
	roomKey?: string;
	userId?: string;
	enabled?: boolean;
	onBroadcastMovies?: (data: BroadcastMoviesPayload) => void;
};

export function useMatchWebSocket({
	roomKey,
	userId,
	enabled = true,
	onBroadcastMovies,
}: UseMatchWebSocketOptions) {
	const queryClient = useQueryClient();
	const roomKeyRef = useRef(roomKey);
	const onBroadcastRef = useRef(onBroadcastMovies);
	roomKeyRef.current = roomKey;
	onBroadcastRef.current = onBroadcastMovies;

	useEffect(() => {
		if (!enabled) return;
		const token = getAccessToken();
		matchWebSocketService.connect(token ?? undefined);
	}, [enabled]);

	useEffect(() => {
		if (!enabled || !roomKey || !userId) return;
		matchWebSocketService.joinMatchRoom(roomKey, userId);
	}, [enabled, roomKey, userId]);

	useEffect(() => {
		if (!enabled) return;

		const handleBroadcastMovies = (data: BroadcastMoviesPayload) => {
			const key = roomKeyRef.current;
			if (!key) return;
			if (data.roomKey != null && data.roomKey !== key) return;

			queryClient.invalidateQueries({
				queryKey: roomMoviesQueryKey(key),
			});
			queryClient.invalidateQueries({
				queryKey: getRoomsControllerGetRoomStateQueryKey(key),
			});
			onBroadcastRef.current?.(data);
		};

		const unsubBroadcast = matchWebSocketService.on(
			"broadcastMovies",
			handleBroadcastMovies,
		);
		const unsubMatchUpdated = matchWebSocketService.on("matchUpdated", () => {
			const key = roomKeyRef.current;
			if (!key) return;
			queryClient.invalidateQueries({
				queryKey: getRoomsControllerGetRoomStateQueryKey(key),
			});
		});

		return () => {
			unsubBroadcast();
			unsubMatchUpdated();
		};
	}, [enabled, queryClient]);
}
