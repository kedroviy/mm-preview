"use client";

import { Card } from "@mm-preview/ui";
import type { RoomChoicesProps } from "../model/types";

export function RoomChoices({ room, currentUserId }: RoomChoicesProps) {
  return (
    <Card title="Выборы фильмов" className="h-full">
      <div className="flex flex-col gap-2">
        {Object.keys(room.choices).length > 0 ? (
          Object.entries(room.choices).map(([userInRoomId, movieId]) => (
            <div key={userInRoomId} className="p-2 rounded bg-surface-100">
              <div className="flex items-center justify-between">
                <span>
                  {userInRoomId === currentUserId
                    ? "Вы"
                    : `User ${userInRoomId.slice(0, 8)}`}
                </span>
                <span className="font-medium">{movieId}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-color">Пока нет выборов</p>
        )}
      </div>
    </Card>
  );
}
