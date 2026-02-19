"use client";

import { useUsersController_getProfile } from "@mm-preview/sdk";
import { Button, ProgressSpinner } from "@mm-preview/ui";
import {
  useViewTransition,
  ViewTransition,
} from "@/src/shared/components/ViewTransition";
import { useWebSocketMyRooms } from "@/src/shared/hooks/useWebSocketMyRooms";
import type { Room } from "@/src/entities/room";

interface DashboardClientProps {
  userId: string;
  initialProfile?: {
    userId: string;
    name: string;
    role?: string;
    lastActive?: number;
    recentRooms?: string[];
    rooms?: Room[];
  } | null;
}

export function DashboardClient({
  userId,
  initialProfile,
}: DashboardClientProps) {
  // Если есть initialProfile, отключаем запрос через хук
  // Иначе используем хук для запроса
  // queryKey устанавливается внутри хука, поэтому используем as any для обхода проверки типов
  const queryResult = useUsersController_getProfile(
    initialProfile ? ({ enabled: false } as any) : undefined,
  );

  // Используем initialProfile если есть, иначе данные из запроса
  type ProfileType = {
    userId: string;
    name: string;
    role?: string;
    lastActive?: number;
    recentRooms?: string[];
    rooms?: Room[];
  };
  const profile = (initialProfile || queryResult.data) as
    | ProfileType
    | null
    | undefined;
  const isLoading = initialProfile ? false : queryResult.isLoading;
  const error = initialProfile ? null : queryResult.error;
  const profileUserId = profile?.userId || userId;
  const { rooms: myRooms, isLoading: isMyRoomsLoading } = useWebSocketMyRooms(
    profileUserId,
    !!profileUserId,
  );
  const { navigate, isPending } = useViewTransition();

  if (isLoading && !initialProfile) {
    return (
      <div
        className="min-h-screen p-8 flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="text-center" suppressHydrationWarning>
          <ProgressSpinner aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        className="min-h-screen p-8 flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="text-center" suppressHydrationWarning>
          <p className="text-lg text-red-600">Failed to load user profile</p>
        </div>
      </div>
    );
  }

  const user = profile;

  return (
    <ViewTransition name="page">
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, <span className="text-primary">{user.name}</span>!
          </h1>
          <p className="text-muted-color mb-8">Ваш личный кабинет</p>

          <div className="flex flex-wrap gap-4">
            <ViewTransition name="rooms-button">
              <Button
                type="button"
                label="Комнаты"
                icon="pi pi-home"
                {...(!isMyRoomsLoading &&
                  myRooms &&
                  myRooms.length > 0 && {
                  badge: String(myRooms.length),
                  badgeSeverity: "warning",
                })}
                tooltip="Создайте комнату, присоединитесь к существующей или вернитесь в недавнюю комнату"
                tooltipOptions={{ position: "bottom" }}
                onClick={() => {
                  navigate(`/${user.userId}/rooms`);
                }}
                disabled={isPending}
              />
            </ViewTransition>

            <ViewTransition name="movies-button">
              <Button
                type="button"
                label="Movies"
                icon="pi pi-video"
                tooltip="Browse and discover new movies"
                tooltipOptions={{ position: "bottom" }}
              />
            </ViewTransition>

            <ViewTransition name="recommendations-button">
              <Button
                type="button"
                label="Recommendations"
                icon="pi pi-star"
                tooltip="Get personalized movie recommendations"
                tooltipOptions={{ position: "bottom" }}
                outlined
              />
            </ViewTransition>
          </div>
        </div>
      </div>
    </ViewTransition>
  );
}
