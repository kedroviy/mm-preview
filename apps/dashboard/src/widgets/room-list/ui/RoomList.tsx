"use client";

import { DataTable, Column, Card, SpeedDial, Button } from "@mm-preview/ui";
import { ConnectIcon, DeleteIcon } from "@mm-preview/ui";
import { useMemo, type MouseEvent } from "react";
import type { Room } from "@/src/entities/room";
import type { RoomListProps } from "../model/types";
import { useWebSocketMyRooms } from "@/src/shared/hooks/useWebSocketMyRooms";
import { useSearchParams } from "next/navigation";
import styles from "./RoomList.module.css";

export function RoomList({
  initialRooms = [],
  onConnect,
  onDelete
}: RoomListProps) {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  const { rooms: wsRooms, isLoading: isWsLoading } = useWebSocketMyRooms(userId, !!userId);
  const rooms = wsRooms.length > 0 ? wsRooms : initialRooms;
  const isRoomsLoading = isWsLoading;

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
          <Column
            header="Действия"
            style={{ minWidth: "100px" }}
          />
        </DataTable>
      </Card>
    );
  }

  // Показываем пустое сообщение только после завершения загрузки, если комнат нет
  if (!isRoomsLoading && (!rooms || rooms.length === 0)) {
    return (
      <Card className="mt-6">
        <p className="text-center text-muted-color">
          У вас пока нет комнат. Создайте новую комнату или присоединитесь к существующей.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Мои комнаты" className={`${styles.tableContainer} mt-6`} style={{ position: "relative", overflow: "visible" }}>
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
            body={(room: Room) => {
            const items = useMemo(() => {
              const actions = [];

              // Подключиться - слева
              actions.push({
                label: "Подключиться",
                icon: <ConnectIcon className="w-4 h-4" />,
                command: () => onConnect(room.roomId),
                template: (item: any, options: any) => {
                  return (
                    <Button
                      rounded
                      icon={<ConnectIcon className="w-4 h-4" />}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        item.command();
                      }}
                      aria-label="Подключиться"
                      className={styles.speeddialButton}
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
                  template: (item: any, options: any) => {
                    return (
                      <Button
                        rounded
                        icon={<DeleteIcon className="w-4 h-4" />}
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          item.command();
                        }}
                        aria-label="Удалить"
                        className={styles.speeddialButton}
                      />
                    );
                  },
                });
              }

              return actions;
            }, [room.roomId, room.isCreator, onConnect, onDelete]);

               return (
                 <div className={styles.speeddialContainer}>
                   <div className={styles.speeddialWrapper}>
                     <SpeedDial
                       model={items}
                       direction="down"
                       type="semi-circle"
                       mask
                      //  buttonClassName="p-button-rounded p-button-text"
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

