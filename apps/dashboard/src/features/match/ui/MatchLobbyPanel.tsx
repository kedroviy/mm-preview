"use client";

import type { Room } from "@mm-preview/sdk";
import { Button, Card } from "@mm-preview/ui";

type MatchLobbyPanelProps = {
	room: Room;
	userId: string;
	isAdmin: boolean;
	hasMovies: boolean;
	isStarting: boolean;
	onStartMatch: () => void;
	onContinueMatch: () => void;
	onOpenFilters: () => void;
};

function getPhaseLabel(phase?: Room["matchPhase"]): string {
	switch (phase) {
		case "LOBBY":
			return "Лобби — ожидание старта";
		case "SWIPING":
			return "Идёт подбор фильмов";
		case "WAITING_ROUND":
			return "Ожидание участников";
		case "FINAL_PICK":
			return "Финальный выбор";
		default:
			return "Лобби";
	}
}

export function MatchLobbyPanel({
	room,
	userId,
	isAdmin,
	hasMovies,
	isStarting,
	onStartMatch,
	onContinueMatch,
	onOpenFilters,
}: MatchLobbyPanelProps) {
	return (
		<Card>
			<div className="flex items-center justify-between gap-4 mb-4">
				<div>
					<h2 className="text-xl font-bold">Подбор фильмов</h2>
					<p className="text-sm text-muted-color mt-1">
						{getPhaseLabel(room.matchPhase)}
					</p>
				</div>
				{isAdmin ? (
					<Button
						icon="pi pi-cog"
						rounded
						text
						aria-label="Настройки фильтров"
						onClick={onOpenFilters}
					/>
				) : null}
			</div>
			<div className="flex flex-col gap-4">
				{room.participants && room.participants.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{room.participants.map((p) => {
							const isSelf = p.userId === userId;
							return (
								<li
									key={p.userId}
									className={`flex justify-between rounded-lg px-3 py-2 ${
										isSelf
											? "bg-primary/10 border border-primary/30"
											: "bg-surface-50"
									}`}
								>
									<span className="font-medium">
										{p.name}
										{isSelf ? " (вы)" : ""}
										{p.role.toLowerCase() === "admin" ? " · админ" : ""}
									</span>
									<span className="text-sm text-muted-color">
										{p.userStatus === "WAITING" ? "ждёт" : "активен"}
										{p.likedCount != null && p.likedCount > 0
											? ` · ${p.likedCount} ❤`
											: ""}
									</span>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="text-muted-color text-sm">Участники загружаются…</p>
				)}
				{hasMovies ? (
					<Button
						label="Продолжить подбор"
						icon="pi pi-play"
						onClick={onContinueMatch}
						className="w-full"
						size="l"
					/>
				) : isAdmin ? (
					<Button
						label="Начать подбор"
						icon="pi pi-play"
						loading={isStarting}
						onClick={onStartMatch}
						className="w-full"
						size="l"
					/>
				) : (
					<p className="text-sm text-muted-color text-center py-2">
						Ожидайте, пока администратор комнаты нажмёт «Начать подбор»
					</p>
				)}
			</div>
		</Card>
	);
}
