"use client";

import { useLikeMovie, type LikeMovieDto } from "@mm-preview/sdk";
import { useCallback, useRef } from "react";

/** Serializes like HTTP calls so check-status runs after all pending likes. */
export function useLikeMovieQueue() {
	const likeMutation = useLikeMovie();
	const tailRef = useRef<Promise<void>>(Promise.resolve());

	const waitForPendingLikes = useCallback(() => tailRef.current, []);

	const likeMovie = useCallback(
		(likeData: LikeMovieDto) => {
			const next = tailRef.current
				.then(async () => {
					await likeMutation.mutateAsync(likeData);
				})
				.catch(() => undefined);
			tailRef.current = next;
			return next;
		},
		[likeMutation],
	);

	return {
		likeMovie,
		waitForPendingLikes,
		isProcessing: likeMutation.isPending,
	};
}
