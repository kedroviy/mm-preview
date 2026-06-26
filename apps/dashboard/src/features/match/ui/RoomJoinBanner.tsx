"use client";

import { useJoinRoom } from "@mm-preview/sdk";
import { Button, Card, notificationService } from "@mm-preview/ui";
import { useCallback } from "react";

type RoomJoinBannerProps = {
	publicCode: string;
	userId: string;
	onJoined: () => void;
};

export function RoomJoinBanner({
	publicCode,
	userId,
	onJoined,
}: RoomJoinBannerProps) {
	const joinRoom = useJoinRoom();

	const handleJoin = useCallback(async () => {
		try {
			await joinRoom.mutateAsync({
				key: publicCode,
				userId: Number(userId),
			});
			notificationService.showSuccess("Вы присоединились к комнате");
			onJoined();
		} catch {
			notificationService.showError("Не удалось присоединиться к комнате");
		}
	}, [publicCode, userId, joinRoom, onJoined]);

	return (
		<Card className="mb-6 border-primary/30 bg-primary/5">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<p className="text-center sm:text-left">
					Вы ещё не в этой комнате. Присоединитесь, чтобы участвовать в подборе
					фильмов и чате.
				</p>
				<Button
					label="Присоединиться"
					icon="pi pi-sign-in"
					loading={joinRoom.isPending}
					onClick={handleJoin}
				/>
			</div>
		</Card>
	);
}
