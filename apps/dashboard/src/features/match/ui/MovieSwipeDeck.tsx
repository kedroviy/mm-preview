"use client";

import type { Movie } from "@mm-preview/sdk";
import { Button, ProgressSpinner } from "@mm-preview/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLikeMovieQueue } from "../hooks/useLikeMovieQueue";
import { MovieSwipeCard } from "./MovieSwipeCard";
import { MatchWaitingCard } from "./MatchWaitingCard";

type MovieSwipeDeckProps = {
	movies: Movie[];
	roomKey: string;
	userId: number;
	onDeckFinished: () => Promise<void>;
	onFinalMovie?: () => void;
};

function deckSnapshot(docs: Movie[]): string {
	if (!docs.length) return "";
	return `${docs.length}:${docs[0]?.id}:${docs[docs.length - 1]?.id}`;
}

export function MovieSwipeDeck({
	movies,
	roomKey,
	userId,
	onDeckFinished,
	onFinalMovie,
}: MovieSwipeDeckProps) {
	const [cardIndex, setCardIndex] = useState(0);
	const [isWaiting, setIsWaiting] = useState(false);
	const deckSnapshotAtWaitRef = useRef<string | null>(null);
	const finishingRef = useRef(false);
	const { likeMovie, waitForPendingLikes } = useLikeMovieQueue();

	const currentMovie = movies[cardIndex];
	const isLastCard = cardIndex >= movies.length && movies.length > 0;

	useEffect(() => {
		setCardIndex(0);
		setIsWaiting(false);
		deckSnapshotAtWaitRef.current = null;
		finishingRef.current = false;
	}, [deckSnapshot(movies)]);

	useEffect(() => {
		if (!isWaiting) return;
		const baseline = deckSnapshotAtWaitRef.current;
		if (!baseline || !movies.length) return;
		const snap = deckSnapshot(movies);
		if (snap !== baseline) {
			deckSnapshotAtWaitRef.current = null;
			setCardIndex(0);
			setIsWaiting(false);
			finishingRef.current = false;
		}
	}, [movies, isWaiting]);

	const finishDeck = useCallback(async () => {
		if (finishingRef.current) return;
		finishingRef.current = true;
		deckSnapshotAtWaitRef.current = deckSnapshot(movies);
		setIsWaiting(true);
		try {
			await waitForPendingLikes();
			await onDeckFinished();
		} catch {
			setIsWaiting(false);
			finishingRef.current = false;
		}
	}, [movies, onDeckFinished, waitForPendingLikes]);

	useEffect(() => {
		if (isLastCard && !isWaiting && !finishingRef.current) {
			void finishDeck();
		}
	}, [isLastCard, isWaiting, finishDeck]);

	const handleLike = useCallback(() => {
		if (!currentMovie?.id) return;
		void likeMovie({ roomKey, userId, movieId: currentMovie.id });
		setCardIndex((i) => i + 1);
	}, [currentMovie, likeMovie, roomKey, userId]);

	const handleDislike = useCallback(() => {
		setCardIndex((i) => i + 1);
	}, []);

	if (!movies.length) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<ProgressSpinner aria-label="Загрузка фильмов" />
			</div>
		);
	}

	if (isWaiting) {
		return <MatchWaitingCard />;
	}

	if (!currentMovie) {
		return <MatchWaitingCard />;
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="mx-auto w-full max-w-sm min-h-[480px]">
				<MovieSwipeCard movie={currentMovie} />
			</div>
			<div className="flex items-center justify-center gap-6">
				<Button
					severity="danger"
					rounded
					className="!w-14 !h-14"
					icon="pi pi-times"
					aria-label="Пропустить"
					onClick={handleDislike}
				/>
				<span className="text-sm text-muted-color">
					{cardIndex + 1} / {movies.length}
				</span>
				<Button
					severity="success"
					rounded
					className="!w-14 !h-14"
					icon="pi pi-heart"
					aria-label="Нравится"
					onClick={handleLike}
				/>
			</div>
			{movies.length === 1 && onFinalMovie ? (
				<p className="text-center text-sm text-muted-color">
					Финальный раунд — выберите фильм, который вам подходит
				</p>
			) : null}
		</div>
	);
}
