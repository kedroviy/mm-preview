"use client";

import type { RoomFiltersPayload } from "@mm-preview/sdk";
import { Button, Card, InputText } from "@mm-preview/ui";
import { useCallback, useState } from "react";

type MatchFiltersDialogProps = {
	visible: boolean;
	onHide: () => void;
	onSave: (filters: RoomFiltersPayload) => void;
	isSaving?: boolean;
};

const DEFAULT_RATING: [number, number] = [0, 10];

export function MatchFiltersDialog({
	visible,
	onHide,
	onSave,
	isSaving,
}: MatchFiltersDialogProps) {
	const [minRating, setMinRating] = useState("6");
	const [yearFrom, setYearFrom] = useState("2000");
	const [yearTo, setYearTo] = useState("2025");

	const handleSave = useCallback(() => {
		const min = Number(minRating);
		const from = Number(yearFrom);
		const to = Number(yearTo);
		const selectedRating: [number, number] = [
			Number.isFinite(min) ? Math.min(10, Math.max(0, min)) : 0,
			10,
		];
		const years: RoomFiltersPayload["selectedYears"] = [];
		if (Number.isFinite(from) && Number.isFinite(to) && from <= to) {
			for (let y = from; y <= to; y += 1) {
				years.push({ id: y, label: String(y) });
			}
		}
		onSave({
			selectedCountries: [],
			selectedGenres: [],
			excludeGenre: [],
			selectedYears: years,
			selectedRating,
		});
	}, [minRating, yearFrom, yearTo, onSave]);

	if (!visible) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-md shadow-xl">
				<h3 className="text-lg font-bold mb-4">Фильтры подбора</h3>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label htmlFor="minRating" className="font-medium text-sm">
							Минимальный рейтинг Кинопоиска
						</label>
						<InputText
							id="minRating"
							type="number"
							min={0}
							max={10}
							step={0.1}
							value={minRating}
							onChange={(e) => setMinRating(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-2">
							<label htmlFor="yearFrom" className="font-medium text-sm">
								Год от
							</label>
							<InputText
								id="yearFrom"
								type="number"
								value={yearFrom}
								onChange={(e) => setYearFrom(e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label htmlFor="yearTo" className="font-medium text-sm">
								Год до
							</label>
							<InputText
								id="yearTo"
								type="number"
								value={yearTo}
								onChange={(e) => setYearTo(e.target.value)}
							/>
						</div>
					</div>
					<p className="text-xs text-muted-color">
						По умолчанию: рейтинг {DEFAULT_RATING[0]}–{DEFAULT_RATING[1]}.
					</p>
					<div className="flex gap-2 pt-2">
						<Button label="Отмена" outlined className="flex-1" onClick={onHide} />
						<Button
							label="Применить"
							className="flex-1"
							loading={isSaving}
							onClick={handleSave}
						/>
					</div>
				</div>
			</Card>
		</div>
	);
}
