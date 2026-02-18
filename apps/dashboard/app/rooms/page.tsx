"use client";

import {
  useCreateRoom,
  useJoinRoom,
  useRoom,
  useUser,
  type Room,
} from "@mm-preview/sdk";
import { Button, notificationService, DataTable, Column, Card } from "@mm-preview/ui";
import { InputText } from "primereact/inputtext";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useViewTransition, ViewTransition } from "@/src/shared/components/ViewTransition";
import { useWebSocketMyRooms } from "@/src/shared/hooks/useWebSocketMyRooms";
import { useTokenRefresh } from "@/src/shared/hooks/useTokenRefresh";

type ViewMode = "menu" | "create" | "join" | "recent";

function RoomsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const { data: user } = useUser(userId);
  const { rooms: myRooms, isLoading: isMyRoomsLoading, refreshRooms } = useWebSocketMyRooms(userId, !!userId);
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const { navigate, isPending } = useViewTransition();
  
  // Проверяем и обновляем токен при загрузке страницы
  useTokenRefresh();

  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  const handleCreateRoom = async () => {
    if (!userId) return;

    try {
      const result = await createRoom.mutateAsync(
        roomName ? { name: roomName } : undefined,
      );
      notificationService.showSuccess(
        `Комната создана! Код: ${result.publicCode}`,
      );
      // Обновляем список комнат
      refreshRooms();
      // Переход в комнату
      navigate(`/rooms/${result.roomId}?userId=${userId}`);
    } catch (error) {
      notificationService.showError(
        "Не удалось создать комнату. Попробуйте еще раз.",
      );
    }
  };

  const handleJoinRoom = async () => {
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
      // Обновляем список комнат
      refreshRooms();
      // Переход в комнату
      navigate(`/rooms/${result.roomId}?userId=${userId}`);
    } catch (error) {
      notificationService.showError(
        "Не удалось присоединиться к комнате. Проверьте код.",
      );
    }
  };

  const handleRejoinRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}?userId=${userId}`);
  };

  if (!userId) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-color">User ID is required</p>
        </div>
      </div>
    );
  }

  if (viewMode === "menu") {
    return (
      <ViewTransition name="page">
        <div className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                onClick={() => navigate(`/?userId=${userId}`)}
                text
                className="mb-4"
                disabled={isPending}
              >
                ← Назад к дашборду
              </Button>
            <h1 className="text-4xl font-bold mb-2">Комнаты</h1>
            <p className="text-muted-color">
              Создайте новую комнату, присоединитесь к существующей или вернитесь
              в недавнюю
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card
              title="Создать комнату"
              className="h-full cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setViewMode("create")}
            >
              <p className="m-0 mb-4">
                Создайте новую комнату для просмотра фильмов с друзьями
              </p>
              <Button className="w-full">Создать</Button>
            </Card>

            <Card
              title="Присоединиться"
              className="h-full cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setViewMode("join")}
            >
              <p className="m-0 mb-4">
                Присоединитесь к комнате по 6-значному коду
              </p>
              <Button className="w-full" outlined>
                Присоединиться
              </Button>
            </Card>
          </div>

          {/* Таблица с комнатами пользователя */}
          {myRooms && myRooms.length > 0 && (
            <Card title="Мои комнаты" className="mt-6">
              <DataTable
                data={myRooms}
                loading={isMyRoomsLoading}
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
                        onClick={() => handleRejoinRoom(room.roomId)}
                        icon="pi pi-sign-in"
                        size="small"
                      >
                        Подключиться
                      </Button>
                      {room.isCreator && (
                        <Button
                          onClick={() => {
                            // TODO: Реализовать удаление комнаты
                            notificationService.showInfo("Удаление комнаты будет реализовано позже");
                          }}
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
          )}

          {!isMyRoomsLoading && myRooms && myRooms.length === 0 && (
            <Card className="mt-6">
              <p className="text-center text-muted-color">
                У вас пока нет комнат. Создайте новую комнату или присоединитесь к существующей.
              </p>
            </Card>
          )}
        </div>
      </div>
      </ViewTransition>
    );
  }

  if (viewMode === "create") {
    return (
      <ViewTransition name="page">
        <div className="min-h-screen p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button
                onClick={() => setViewMode("menu")}
                text
                className="mb-4"
              >
                ← Назад
              </Button>
            <h1 className="text-4xl font-bold mb-2">Создать комнату</h1>
          </div>

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

              <Button
                onClick={handleCreateRoom}
                disabled={createRoom.isPending}
                className="w-full"
              >
                {createRoom.isPending ? "Создание..." : "Создать комнату"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </ViewTransition>
    );
  }

  if (viewMode === "join") {
    return (
      <ViewTransition name="page">
        <div className="min-h-screen p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button
                onClick={() => setViewMode("menu")}
                text
                className="mb-4"
              >
                ← Назад
              </Button>
            <h1 className="text-4xl font-bold mb-2">Присоединиться к комнате</h1>
            <p className="text-muted-color">
              Введите 6-значный код комнаты для присоединения
            </p>
          </div>

          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="roomCode" className="font-medium">
                  Код комнаты
                </label>
                <InputText
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="text-2xl text-center tracking-widest"
                />
                <small className="text-muted-color">
                  Введите 6-значный код комнаты
                </small>
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={joinRoom.isPending || roomCode.length !== 6}
                className="w-full"
              >
                {joinRoom.isPending ? "Присоединение..." : "Присоединиться"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </ViewTransition>
    );
  }

  if (viewMode === "recent") {
    return (
      <ViewTransition name="page">
        <div className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                onClick={() => setViewMode("menu")}
                text
                className="mb-4"
              >
                ← Назад
              </Button>
            <h1 className="text-4xl font-bold mb-2">Мои комнаты</h1>
            <p className="text-muted-color mb-4">
              Выберите комнату для переподключения
            </p>
          </div>

          {isMyRoomsLoading ? (
            <Card>
              <p className="text-center text-muted-color">Загрузка комнат...</p>
            </Card>
          ) : myRooms && myRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRooms.map((room) => (
                <MyRoomCard
                  key={room.roomId}
                  room={room}
                  userId={userId}
                  onReconnect={handleRejoinRoom}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-muted-color">
                У вас пока нет комнат
              </p>
            </Card>
          )}
        </div>
      </div>
      </ViewTransition>
    );
  }

  return null;
}

function MyRoomCard({
  room,
  userId,
  onReconnect,
}: {
  room: Room;
  userId: string;
  onReconnect: (roomId: string) => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Комната {room.publicCode}</h3>
            {room.isCreator && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                Создатель
              </span>
            )}
          </div>
          <p className="text-sm text-muted-color">
            Участников: {room.users.length}
          </p>
          {room.currentUserRole && (
            <p className="text-xs text-muted-color mt-1">
              Ваша роль: {room.currentUserRole === "room_creator" ? "Создатель" : "Участник"}
            </p>
          )}
        </div>
        <Button onClick={() => onReconnect(room.roomId)} className="w-full">
          Переподключиться
        </Button>
      </div>
    </Card>
  );
}

// Loading state теперь обрабатывается через loading.tsx
// Suspense используется только для useSearchParams
export default function RoomsPage() {
  return (
    <Suspense fallback={null}>
      <RoomsContent />
    </Suspense>
  );
}

