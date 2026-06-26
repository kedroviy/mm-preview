"use client";

import type { Movie } from "@mm-preview/sdk";
import { Badge } from "@mm-preview/ui";
import Image from "next/image";
import { useState } from "react";

function getRatingColor(rating?: number | null): string {
	if (rating == null) return "bg-surface-500";
	if (rating >= 7) return "bg-green-600";
	if (rating >= 5) return "bg-yellow-600";
	return "bg-red-600";
}

function roundRating(rating?: number | null): string {
	if (rating == null) return "—";
	return (Math.floor(rating * 10) / 10).toFixed(1);
}

type MovieSwipeCardProps = {
	movie: Movie;
};

export function MovieSwipeCard({ movie }: MovieSwipeCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const posterUrl = movie.poster?.previewUrl ?? movie.poster?.url ?? null;

	return (
		<div className="flex flex-col overflow-hidden rounded-2xl bg-surface-0 shadow-lg border border-surface-200 h-full">
			<div className="relative aspect-[2/3] w-full bg-surface-100 shrink-0">
				{posterUrl ? (
					<Image
						src={posterUrl}
						alt={movie.name ?? "Фильм"}
						fill
						className="object-cover"
						unoptimized
					/>
				) : (
					<div className="flex h-full items-center justify-center text-muted-color">
						Нет постера
					</div>
				)}
				<span
					className={`absolute right-3 top-3 rounded px-2 py-1 text-sm font-semibold text-white ${getRatingColor(movie.rating?.kp)}`}
				>
					{roundRating(movie.rating?.kp)}
				</span>
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<h3 className="text-lg font-bold leading-tight">
					{movie.name}
					{movie.year ? ` (${movie.year})` : ""}
				</h3>
				<div className="flex flex-wrap gap-1">
					{movie.ageRating != null && movie.ageRating > 0 ? (
						<Badge value={`${movie.ageRating}+`} severity="danger" />
					) : null}
					{movie.movieLength != null && movie.movieLength > 0 ? (
						<Badge value={`${movie.movieLength} мин`} />
					) : null}
					{movie.countries?.[0]?.name ? (
						<Badge value={movie.countries[0].name} />
					) : null}
					{movie.genres?.[0]?.name ? (
						<Badge value={movie.genres[0].name} />
					) : null}
				</div>
				<p
					className={`text-sm text-muted-color ${isExpanded ? "" : "line-clamp-4"}`}
				>
					{movie.description ?? movie.shortDescription ?? "Нет описания"}
				</p>
				{(movie.description ?? movie.shortDescription) ? (
					<button
						type="button"
						className="text-left text-sm text-primary hover:underline"
						onClick={() => setIsExpanded((v) => !v)}
					>
						{isExpanded ? "Свернуть" : "Развернуть"}
					</button>
				) : null}
			</div>
		</div>
	);
}
