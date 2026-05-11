"use client";

import { roomKeys } from "@mm-preview/sdk";
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

const ROOMS_SHELL =
  "min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf5ff] via-[#fff7ed] to-[#e0f2fe]";

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
    queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() });
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

  const handleDelete = (_roomId: string) => {
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
        <div className={`${ROOMS_SHELL} p-6 sm:p-8`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="mb-8">
              <Button
                onClick={() => navigate(`/${userId}`)}
                text
                className="mb-4 !text-slate-600"
                disabled={isPending}
              >
                ← Назад к дашборду
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-rose-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Комнаты
              </h1>
              <p className="text-slate-600 max-w-xl">
                Создайте новую комнату, присоединитесь к существующей или
                вернитесь в недавнюю
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card
                title="Создать комнату"
                className="h-full cursor-pointer border-white/60 bg-white/55 backdrop-blur-md shadow-lg shadow-rose-200/20 hover:shadow-xl transition-shadow"
                onClick={() => setViewMode("create")}
              >
                <p className="m-0 mb-4 text-slate-600">
                  Создайте новую комнату для просмотра фильмов с друзьями
                </p>
                <Button className="w-full">Создать</Button>
              </Card>

              <Card
                title="Присоединиться"
                className="h-full cursor-pointer border-white/60 bg-white/55 backdrop-blur-md shadow-lg shadow-fuchsia-200/20 hover:shadow-xl transition-shadow"
                onClick={() => setViewMode("join")}
              >
                <p className="m-0 mb-4 text-slate-600">
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
        <div className={`${ROOMS_SHELL} p-6 sm:p-8`}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="mb-6">
              <Button
                onClick={() => setViewMode("menu")}
                text
                className="mb-4 !text-slate-600"
              >
                ← Назад
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 to-rose-600 bg-clip-text text-transparent mb-2">
                Создать комнату
              </h1>
            </div>

            <CreateRoomForm
              userId={userId}
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
        <div className={`${ROOMS_SHELL} p-6 sm:p-8`}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="mb-6">
              <Button
                onClick={() => setViewMode("menu")}
                text
                className="mb-4 !text-slate-600"
              >
                ← Назад
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                Присоединиться к комнате
              </h1>
              <p className="text-slate-600">
                Введите 6-значный код комнаты для присоединения
              </p>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/55 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
              <JoinRoomForm
                userId={userId}
                onSuccess={handleJoinSuccess}
                onCancel={() => setViewMode("menu")}
              />
            </div>
          </div>
        </div>
      </ViewTransition>
    );
  }

  return null;
}
