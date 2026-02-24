"use client";

import type { RoomRole } from "@mm-preview/sdk";
import { Button, Card } from "@mm-preview/ui";
import type { RoomMembersProps } from "../model/types";

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

export function RoomMembers({
  room,
  members,
  currentUserId,
  canManage,
  onRemoveMember,
}: RoomMembersProps) {
  return (
    <Card title="Участники" className="h-full">
      <div className="flex flex-col gap-2">
        {members && members.length > 0 ? (
          members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const memberRole = room.userRoles[member.userId];
            return (
              <div
                key={member.userId}
                className={`p-2 rounded ${
                  isCurrentUser
                    ? "bg-primary/10 border border-primary"
                    : "bg-surface-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {isCurrentUser ? "Вы" : member.name}
                    </span>
                    <span className="text-xs text-muted-color">
                      {getRoleLabel(memberRole)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.choices[member.userId] && (
                      <span className="text-sm text-muted-color">
                        Выбрал фильм
                      </span>
                    )}
                    {canManage && !isCurrentUser && (
                      <Button
                        size="small"
                        severity="danger"
                        text
                        onClick={() => onRemoveMember?.(member.userId)}
                      >
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted-color">Нет участников</p>
        )}
      </div>
    </Card>
  );
}
