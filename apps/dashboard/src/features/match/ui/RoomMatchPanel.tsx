"use client";

import type { Room } from "@mm-preview/sdk";
import {
	isRoomAdmin,
	matchWebSocketService,
	useCheckMatchStatus,
	useRoomMovies,
	useStartMatch,
	useUpdateMatchUserStatus,
	useUpdateRoomFilters,
} from "@mm-preview/sdk";
import { Card, notificationService, ProgressSpinner } from "@mm-preview/ui";
import { useCallback, useEffect, useState } from "react";
import { useMatchWebSocket } from "../hooks/useMatchWebSocket";
import { MatchFiltersDialog } from "./MatchFiltersDialog";
import { MatchLobbyPanel } from "./MatchLobbyPanel";
import { MatchResultCard } from "./MatchResultCard";
import { MatchWaitingCard } from "./MatchWaitingCard";
import { MovieSwipeDeck } from "./MovieSwipeDeck";

type RoomMatchPanelProps = {
	room: Room;
	userId: string;
	onBackToRooms: () => void;
};

type MatchView = "lobby" | "swiping" | "result";

export function RoomMatchPanel({
	room,
	userId,
	onBackToRooms,
}: RoomMatchPanelProps) {
	const roomKey = room.publicCode;
	const numericUserId = Number(userId);
	const isAdmin = isRoomAdmin(room, userId);
	const [view, setView] = useState<MatchView>("lobby");
	const [showResult, setShowResult] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const startMatch = useStartMatch();
	const updateUserStatus = useUpdateMatchUserStatus();
	const checkStatus = useCheckMatchStatus();
	const updateFilters = useUpdateRoomFilters();

	const moviesQuery = useRoomMovies(roomKey, {
		enabled: !!roomKey && room.isMember,
	});

	const movies = moviesQuery.data?.docs ?? [];
	const hasMovies = movies.length > 0;
	const isMatchActive =
		room.matchPhase === "SWIPING" ||
		room.matchPhase === "WAITING_ROUND" ||
		room.matchPhase === "FINAL_PICK" ||
		hasMovies;

	useMatchWebSocket({
		roomKey,
		userId,
		enabled: room.isMember,
		onBroadcastMovies: (data) => {
			if (data.messageForClient) {
				notificationService.showSuccess(data.messageForClient);
			}
			if (data.messageForClient === "Final movie selected") {
				setShowResult(true);
				setView("result");
			} else {
				setView("swiping");
			}
		},
	});

	/** Like movieMatcher lobby: auto-open swipe when deck is available. */
	useEffect(() => {
		if (hasMovies && view === "lobby") {
			setView("swiping");
		}
	}, [hasMovies, view]);

	const handleStartMatch = useCallback(async () => {
		if (!roomKey) return;
		if (!isAdmin) {
			notificationService.showInfo("Только администратор может начать подбор");
			return;
		}
		try {
			await startMatch.mutateAsync({ roomKey });
			matchWebSocketService.requestBroadcastMovies(roomKey);
			setView("swiping");
			await moviesQuery.refetch();
		} catch {
			notificationService.showError("Не удалось начать подбор");
		}
	}, [roomKey, isAdmin, startMatch, moviesQuery]);

	const handleSaveFilters = useCallback(
		async (filters: Parameters<typeof updateFilters.mutateAsync>[0]["filters"]) => {
			try {
				await updateFilters.mutateAsync({
					roomId: room.roomId,
					roomKey,
					filters,
				});
				notificationService.showSuccess("Фильтры обновлены");
				setFiltersOpen(false);
			} catch {
				notificationService.showError("Не удалось сохранить фильтры");
			}
		},
		[room.roomId, roomKey, updateFilters],
	);

	const handleDeckFinished = useCallback(async () => {
		if (!roomKey || Number.isNaN(numericUserId)) return;
		await updateUserStatus.mutateAsync({
			roomKey,
			userId: numericUserId,
			userStatus: "WAITING",
		});
		const idempotencyKey = `${userId}-${roomKey}-${Date.now()}`;
		await checkStatus.mutateAsync({
			roomKey,
			userId: numericUserId,
			idempotencyKey,
		});
		await moviesQuery.refetch();
	}, [
		roomKey,
		numericUserId,
		userId,
		updateUserStatus,
		checkStatus,
		moviesQuery,
	]);

	const handleContinueMatch = useCallback(() => {
		setView("swiping");
		void moviesQuery.refetch();
	}, [moviesQuery]);

	if (!room.isMember) {
		return (
			<Card>
				<p className="text-center text-muted-color py-4">
					Войдите в комнату, чтобы участвовать в подборе фильмов
				</p>
			</Card>
		);
	}

	if (showResult || room.matchPhase === "FINAL_PICK") {
		const resultMovie = movies[0];
		if (resultMovie) {
			return (
				<MatchResultCard movie={resultMovie} onBackToRooms={onBackToRooms} />
			);
		}
	}

	if (
		view === "swiping" ||
		(isMatchActive && room.matchPhase !== "LOBBY" && room.matchPhase !== "WAITING_ROUND")
	) {
		if (moviesQuery.isLoading && !hasMovies) {
			return (
				<Card className="flex min-h-[360px] items-center justify-center">
					<ProgressSpinner aria-label="Загрузка фильмов" />
				</Card>
			);
		}
		if (hasMovies) {
			return (
				<>
					<MatchFiltersDialog
						visible={filtersOpen}
						onHide={() => setFiltersOpen(false)}
						onSave={handleSaveFilters}
						isSaving={updateFilters.isPending}
					/>
					<Card title="Выберите фильм">
						<MovieSwipeDeck
							movies={movies}
							roomKey={roomKey}
							userId={numericUserId}
							onDeckFinished={handleDeckFinished}
						/>
					</Card>
				</>
			);
		}
	}

	if (room.matchPhase === "WAITING_ROUND") {
		return <MatchWaitingCard />;
	}

	return (
		<>
			<MatchFiltersDialog
				visible={filtersOpen}
				onHide={() => setFiltersOpen(false)}
				onSave={handleSaveFilters}
				isSaving={updateFilters.isPending}
			/>
			<MatchLobbyPanel
				room={room}
				userId={userId}
				isAdmin={isAdmin}
				hasMovies={hasMovies}
				isStarting={startMatch.isPending}
				onStartMatch={handleStartMatch}
				onContinueMatch={handleContinueMatch}
				onOpenFilters={() => setFiltersOpen(true)}
			/>
		</>
	);
}
