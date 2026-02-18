"use client";

import { useUser } from "@mm-preview/sdk";
import { Button } from "@mm-preview/ui";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useViewTransition, ViewTransition } from "@/src/shared/components/ViewTransition";
import { useWebSocketMyRooms } from "@/src/shared/hooks/useWebSocketMyRooms";

function DashboardContent() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  const { data: user, isLoading, error } = useUser(userId);
  const { rooms: myRooms, isLoading: isMyRoomsLoading } = useWebSocketMyRooms(userId, !!userId);
  const { navigate, isPending } = useViewTransition();

  if (!userId) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <p className="text-lg text-muted-color">User ID is required</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <p className="text-lg text-red-600">Failed to load user data</p>
        </div>
      </div>
    );
  }

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
                {...(!isMyRoomsLoading && myRooms && myRooms.length > 0 && {
                  badge: String(myRooms.length),
                  badgeSeverity: "warning",
                })}
                tooltip="Создайте комнату, присоединитесь к существующей или вернитесь в недавнюю комнату"
                tooltipOptions={{ position: "bottom" }}
                onClick={() => {
                  navigate(`/rooms?userId=${user.userId}`);
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

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

