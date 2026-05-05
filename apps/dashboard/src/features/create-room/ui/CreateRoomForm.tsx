"use client";

import type { Room } from "@mm-preview/sdk";
import { useCreateRoom } from "@mm-preview/sdk";
import { Button, Card, InputText, notificationService } from "@mm-preview/ui";
import { useCallback, useState } from "react";
import type { CreateRoomFormProps } from "../model/types";

function mapCreateResponseToRoom(result: {
  roomId: string;
  publicCode: string;
}): Room {
  return {
    roomId: result.roomId,
    publicCode: result.publicCode,
    createdBy: null,
    users: [],
    userRoles: {},
    choices: {},
    isMember: true,
    isCreator: true,
    canManage: true,
    currentUserRole: "room_creator",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function CreateRoomForm({
  userId,
  onSuccess,
  onCancel,
}: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const createRoom = useCreateRoom();

  const submitNewApi = useCallback(async () => {
    try {
      const result = await createRoom.mutateAsync(
        roomName ? { name: roomName } : undefined,
      );
      notificationService.showSuccess(
        `Комната создана! Код: ${result.publicCode}`,
      );
      onSuccess?.(mapCreateResponseToRoom(result));
    } catch (_error) {
      notificationService.showError(
        "Не удалось создать комнату. Попробуйте еще раз.",
      );
    }
  }, [roomName, createRoom, onSuccess]);

  const handleSubmit = async () => {
    await submitNewApi();
  };

  const pending = createRoom.isPending;

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
          <Button onClick={handleSubmit} disabled={pending} className="flex-1">
            {pending ? "Создание..." : "Создать комнату"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
