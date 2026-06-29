"use client";

import { Card, ProgressSpinner } from "@mm-preview/ui";

export function MatchWaitingCard() {
	return (
		<Card className="text-center py-12">
			<div className="flex flex-col items-center gap-4">
				<ProgressSpinner aria-label="Ожидание участников" />
				<h3 className="text-lg font-semibold">Ждём остальных участников</h3>
				<p className="text-muted-color max-w-sm">
					Дождитесь, пока все участники комнаты закончат выбирать фильмы. После
					этого появится новая подборка.
				</p>
			</div>
		</Card>
	);
}
