"use client";

import { DataTable, Column, Card } from "@mm-preview/ui";
import { Button } from "@mm-preview/ui";
import type { Room } from "@/src/entities/room";
import type { RoomListProps } from "../model/types";

export function RoomList({ rooms, isLoading, onConnect, onDelete }: RoomListProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <Card className="mt-6">
        <p className="text-center text-muted-color">
          У вас пока нет комнат. Создайте новую комнату или присоединитесь к существующей.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Мои комнаты" className="mt-6">
      <DataTable
        data={rooms}
        loading={isLoading}
        emptyMessage="У вас пока нет комнат"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        className="mt-4"
      >
        <Column
          field="publicCode"
          header="Код комнаты"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="users"
          header="Участников"
          body={(room: Room) => room.users.length}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="isCreator"
          header="Роль"
          body={(room: Room) => (
            <span className={room.isCreator ? "text-primary font-semibold" : ""}>
              {room.isCreator ? "Создатель" : "Участник"}
            </span>
          )}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="createdAt"
          header="Создана"
          body={(room: Room) =>
            new Date(room.createdAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          }
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          header="Действия"
          body={(room: Room) => (
            <div className="flex gap-2">
              <Button
                onClick={() => onConnect(room.roomId)}
                icon="pi pi-sign-in"
                size="small"
              >
                Подключиться
              </Button>
              {room.isCreator && onDelete && (
                <Button
                  onClick={() => onDelete(room.roomId)}
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  outlined
                >
                  Удалить
                </Button>
              )}
            </div>
          )}
          style={{ minWidth: "200px" }}
        />
      </DataTable>
    </Card>
  );
}

