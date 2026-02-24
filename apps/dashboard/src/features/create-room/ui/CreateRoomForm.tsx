"use client";

import { useCreateRoom } from "@mm-preview/sdk";
import { Button, Card, InputText, notificationService } from "@mm-preview/ui";
import { useState } from "react";
import type { CreateRoomFormProps } from "../model/types";

export function CreateRoomForm({ onSuccess, onCancel }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const createRoom = useCreateRoom();

  const handleSubmit = async () => {
    try {
      const result = await createRoom.mutateAsync(
        roomName ? { name: roomName } : undefined,
      );
      notificationService.showSuccess(
        `Комната создана! Код: ${result.publicCode}`,
      );
      onSuccess?.(result);
    } catch (_error) {
      notificationService.showError(
        "Не удалось создать комнату. Попробуйте еще раз.",
      );
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="roomName" className="font-medium">
            Название комнаты (необязательно)
          </label>
          <InputText
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Например: Вечерний просмотр"
          />
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button onClick={onCancel} outlined className="flex-1">
              Отмена
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={createRoom.isPending}
            className="flex-1"
          >
            {createRoom.isPending ? "Создание..." : "Создать комнату"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
