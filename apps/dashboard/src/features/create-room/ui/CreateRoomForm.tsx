"use client";

import type { Room } from "@mm-preview/sdk";
import { useCreateRoom } from "@mm-preview/sdk";
import { Button, Card, InputText, notificationService } from "@mm-preview/ui";
import { useCallback, useState } from "react";
import { useMovieMatchCreateRoom } from "@/src/shared/hooks/useMovieMatchRooms";
import { isMovieMatchLegacy } from "@/src/shared/movie-match";
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
  const movieMatchCreate = useMovieMatchCreateRoom();
  const legacy = isMovieMatchLegacy();

  const submitLegacy = useCallback(async () => {
    const uid = userId ? Number(userId) : Number.NaN;
    if (!userId || !Number.isFinite(uid)) {
      notificationService.showError(
        "Не удалось определить пользователя. Откройте комнаты со страницы дашборда.",
      );
      return;
    }
    try {
      const result: Room = await movieMatchCreate.mutateAsync(uid);
      notificationService.showSuccess(
        `Комната создана! Код: ${result.publicCode}`,
      );
      onSuccess?.(result);
    } catch (_error) {
      notificationService.showError(
        "Не удалось создать комнату. Попробуйте еще раз.",
      );
    }
  }, [userId, movieMatchCreate, onSuccess]);

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
    if (legacy) {
      await submitLegacy();
      return;
    }
    await submitNewApi();
  };

  const pending = legacy ? movieMatchCreate.isPending : createRoom.isPending;

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {!legacy && (
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
        )}

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
