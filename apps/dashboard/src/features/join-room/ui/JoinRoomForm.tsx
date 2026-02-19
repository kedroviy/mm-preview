"use client";

import { useJoinRoom } from "@mm-preview/sdk";
import { Button, Card, InputOtp, notificationService } from "@mm-preview/ui";
import { useState } from "react";
import type { JoinRoomFormProps } from "../model/types";

export function JoinRoomForm({
  userId,
  onSuccess,
  onCancel,
}: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState("");
  const joinRoom = useJoinRoom();

  const handleSubmit = async () => {
    if (!userId || !roomCode) {
      notificationService.showError("Введите код комнаты");
      return;
    }

    if (!/^\d{6}$/.test(roomCode)) {
      notificationService.showError("Код должен состоять из 6 цифр");
      return;
    }

    try {
      const result = await joinRoom.mutateAsync({
        publicCode: roomCode,
        userId,
      });
      notificationService.showSuccess("Вы успешно присоединились к комнате!");
      onSuccess?.(result);
    } catch (error) {
      notificationService.showError(
        "Не удалось присоединиться к комнате. Проверьте код.",
      );
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="roomCode" className="font-medium">
            Код комнаты
          </label>
          <InputOtp
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(String(e.value || ""))}
            length={6}
            integerOnly
            className="flex justify-center"
          />
          <small className="text-muted-color">
            Введите 6-значный код комнаты
          </small>
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button onClick={onCancel} outlined className="flex-1">
              Отмена
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={joinRoom.isPending || roomCode.length !== 6}
            className="flex-1"
          >
            {joinRoom.isPending ? "Присоединение..." : "Присоединиться"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
