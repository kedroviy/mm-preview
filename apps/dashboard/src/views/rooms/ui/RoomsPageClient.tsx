"use client";

import { Button, Card, notificationService } from "@mm-preview/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Room } from "@/src/entities/room";
import { CreateRoomForm } from "@/src/features/create-room";
import { JoinRoomForm } from "@/src/features/join-room";
import {
  useViewTransition,
  ViewTransition,
} from "@/src/shared/components/ViewTransition";
import { useTokenRefresh } from "@/src/shared/hooks/useTokenRefresh";
import { RoomList } from "@/src/widgets/room-list";

type ViewMode = "menu" | "create" | "join";

interface RoomsPageClientProps {
  userId: string;
  initialRooms: Room[];
}

export function RoomsPageClient({
  userId,
  initialRooms,
}: RoomsPageClientProps) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const { navigate, isPending } = useViewTransition();

  useTokenRefresh();

  const refreshRooms = () => {
    // Инвалидируем запрос для обновления списка комнат
    queryClient.invalidateQueries({ queryKey: ["rooms", "RoomsController_getMyRooms"] });
  };

  const handleCreateSuccess = (result: any) => {
    refreshRooms();
    navigate(`/${userId}/rooms/${result.roomId}`);
  };

  const handleJoinSuccess = (result: any) => {
    refreshRooms();
    navigate(`/${userId}/rooms/${result.roomId}`);
  };

  const handleConnect = (roomId: string) => {
    navigate(`/${userId}/rooms/${roomId}`);
  };

  const handleDelete = (roomId: string) => {
    // TODO: Implement room deletion
    notificationService.showInfo("Удаление комнаты будет реализовано позже");
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
                onClick={() => navigate(`/${userId}`)}
                text
                className="mb-4"
                disabled={isPending}
              >
                ← Назад к дашборду
              </Button>
              <h1 className="text-4xl font-bold mb-2">Комнаты</h1>
              <p className="text-muted-color">
                Создайте новую комнату, присоединитесь к существующей или
                вернитесь в недавнюю
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

            <RoomList
              userId={userId}
              initialRooms={initialRooms}
              onConnect={handleConnect}
              onDelete={handleDelete}
            />
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
              <Button onClick={() => setViewMode("menu")} text className="mb-4">
                ← Назад
              </Button>
              <h1 className="text-4xl font-bold mb-2">Создать комнату</h1>
            </div>

            <CreateRoomForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setViewMode("menu")}
            />
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
              <Button onClick={() => setViewMode("menu")} text className="mb-4">
                ← Назад
              </Button>
              <h1 className="text-4xl font-bold mb-2">
                Присоединиться к комнате
              </h1>
              <p className="text-muted-color">
                Введите 6-значный код комнаты для присоединения
              </p>
            </div>

            <JoinRoomForm
              userId={userId}
              onSuccess={handleJoinSuccess}
              onCancel={() => setViewMode("menu")}
            />
          </div>
        </div>
      </ViewTransition>
    );
  }

  return null;
}
