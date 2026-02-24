"use client";

import type { RoomRole } from "@mm-preview/sdk";
import { Button } from "@mm-preview/ui";
import type { RoomHeaderProps } from "../model/types";

function getRoleLabel(role?: RoomRole) {
  switch (role) {
    case "room_creator":
      return "Создатель";
    case "room_member":
      return "Участник";
    default:
      return "";
  }
}

export function RoomHeader({
  room,
  userRole,
  onBack,
  onLeave,
  isLeaving,
  isPending,
}: RoomHeaderProps) {
  return (
    <div className="mb-6">
      <Button onClick={onBack} text className="mb-4" disabled={isPending}>
        ← Назад к комнатам
      </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Комната {room.publicCode}</h1>
          <p className="text-muted-color">
            Участников: {room.users.length} | Выборов:{" "}
            {Object.keys(room.choices).length}
            {userRole && ` | Ваша роль: ${getRoleLabel(userRole)}`}
          </p>
        </div>
        {room.isMember && (
          <Button onClick={onLeave} disabled={isLeaving} outlined>
            {isLeaving ? "Выход..." : "Покинуть комнату"}
          </Button>
        )}
      </div>
    </div>
  );
}
