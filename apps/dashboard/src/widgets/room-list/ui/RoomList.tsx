"use client";

import { useMyRooms } from "@mm-preview/sdk";
import {
  ButtonShadcnWrapper as Button,
  Card,
  ColumnShadcn as Column,
  ConnectIcon,
  DataTableShadcn as DataTable,
  DeleteIcon,
  SpeedDial,
} from "@mm-preview/ui";
import type { MouseEvent } from "react";
import type { Room } from "@/src/entities/room";
import type { RoomListProps } from "../model/types";
import styles from "./RoomList.module.css";

export function RoomList({
  userId,
  initialRooms = [],
  onConnect,
  onDelete,
}: RoomListProps) {
  // Используем REST запрос вместо WebSocket
  const { data: restRooms, isLoading: isRestLoading } = useMyRooms(
    userId ? undefined : { enabled: false },
  );

  // Используем данные из REST запроса, если они есть, иначе initialRooms
  const rooms =
    restRooms && restRooms.length > 0 ? (restRooms as Room[]) : initialRooms;
  const isRoomsLoading = isRestLoading;

  if (isRoomsLoading && rooms.length === 0) {
    return (
      <Card title="Мои комнаты" className="mt-6">
        <DataTable
          data={[]}
          loading={true}
          emptyMessage="Загрузка комнат..."
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
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column
            field="isCreator"
            header="Роль"
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column
            field="createdAt"
            header="Создана"
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column header="Действия" style={{ minWidth: "100px" }} />
        </DataTable>
      </Card>
    );
  }

  // Показываем пустое сообщение только после завершения загрузки, если комнат нет
  if (!isRoomsLoading && (!rooms || rooms.length === 0)) {
    return (
      <Card className="mt-6">
        <p className="text-center text-muted-color">
          У вас пока нет комнат. Создайте новую комнату или присоединитесь к
          существующей.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Мои комнаты"
      className={`${styles.tableContainer} mt-6`}
      style={{ position: "relative", overflow: "visible" }}
    >
      <div style={{ position: "relative", overflow: "visible" }}>
        <DataTable
          data={rooms}
          loading={isRoomsLoading}
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
              <span
                className={room.isCreator ? "text-primary font-semibold" : ""}
              >
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
            body={(room: Room) => {
              // Создаем actions без useMemo (хуки нельзя вызывать в колбэках)
              const actions = [];

              // Подключиться - слева
              actions.push({
                label: "Подключиться",
                icon: <ConnectIcon className="w-4 h-4" />,
                command: () => onConnect(room.roomId),
                template: (item: any, _options: any) => {
                  return (
                    <Button
                      rounded
                      text
                      raised
                      icon={<ConnectIcon className="w-4 h-4" />}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        item.command();
                      }}
                      aria-label="Подключиться"
                    />
                  );
                },
              });

              // Удалить - справа (если создатель)
              if (room.isCreator && onDelete) {
                actions.push({
                  label: "Удалить",
                  icon: <DeleteIcon className="w-4 h-4" />,
                  command: () => onDelete(room.roomId),
                  template: (item: any, _options: any) => {
                    return (
                      <Button
                        rounded
                        text
                        raised
                        icon={<DeleteIcon className="w-4 h-4" />}
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          item.command();
                        }}
                        aria-label="Удалить"
                      />
                    );
                  },
                });
              }

              return (
                <div className={styles.speeddialContainer}>
                  <div className={styles.speeddialWrapper}>
                    <SpeedDial
                      model={actions}
                      direction="down"
                      radius={80}
                      type="circle"
                      mask
                      buttonClassName="p-button-warning"
                      buttonStyle={{ width: "2rem", height: "2rem" }}
                    />
                  </div>
                </div>
              );
            }}
            style={{ minWidth: "80px", position: "relative" }}
          />
        </DataTable>
      </div>
    </Card>
  );
}
