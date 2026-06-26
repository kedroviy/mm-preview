"use client";

import type { Movie } from "@mm-preview/sdk";
import { Button, Card } from "@mm-preview/ui";
import Image from "next/image";

type MatchResultCardProps = {
	movie: Movie;
	onBackToRooms: () => void;
};

function buildKinopoiskUrl(movie: Movie): string {
	return `https://www.kinopoisk.ru/film/${movie.id}/`;
}

export function MatchResultCard({ movie, onBackToRooms }: MatchResultCardProps) {
	const posterUrl = movie.poster?.previewUrl ?? movie.poster?.url ?? null;

	return (
		<Card title="Фильм найден!" className="overflow-hidden">
			<div className="flex flex-col md:flex-row gap-6">
				<div className="relative mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-lg bg-surface-100">
					{posterUrl ? (
						<Image
							src={posterUrl}
							alt={movie.name ?? "Фильм"}
							fill
							className="object-cover"
							unoptimized
						/>
					) : null}
				</div>
				<div className="flex flex-1 flex-col gap-3">
					<h2 className="text-2xl font-bold">
						{movie.name}
						{movie.year ? ` (${movie.year})` : ""}
					</h2>
					{movie.rating?.kp != null ? (
						<p className="text-muted-color">
							Рейтинг Кинопоиска: {movie.rating.kp.toFixed(1)}
						</p>
					) : null}
					<p className="text-sm leading-relaxed">
						{movie.description ?? movie.shortDescription}
					</p>
					<div className="mt-auto flex flex-wrap gap-2 pt-4">
						<Button
							label="Открыть на Кинопоиске"
							icon="pi pi-external-link"
							onClick={() => window.open(buildKinopoiskUrl(movie), "_blank")}
						/>
						<Button
							label="К списку комнат"
							severity="secondary"
							outlined
							onClick={onBackToRooms}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
