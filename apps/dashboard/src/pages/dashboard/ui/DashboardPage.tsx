"use client";

import { useUser } from "@mm-preview/sdk";
import { Button, Card } from "@mm-preview/ui";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useViewTransition, ViewTransition } from "@/src/shared/components/ViewTransition";

function DashboardContent() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  const { data: user, isLoading, error } = useUser(userId);
  const { navigate, isPending } = useViewTransition();

  if (!userId) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-color">User ID is required</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
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
          <p className="text-muted-color mb-8">Your personal dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ViewTransition name="rooms-card">
              <div className="flex flex-col gap-3">
                <p className="m-0">
                  Создайте комнату, присоединитесь к существующей или вернитесь в
                  недавнюю комнату
                </p>
                {user.recentRooms && user.recentRooms.length > 0 && (
                  <p className="m-0 text-sm text-muted-color">
                    Недавних комнат: {user.recentRooms.length}
                  </p>
                )}
              </div>
              <Card
                title="Комнаты"
                className="h-full cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  navigate(`/rooms?userId=${user.userId}`);
                }}
              >
                <Button className="mt-2" disabled={isPending}>
                  {isPending ? "Загрузка..." : "Управление комнатами"}
                </Button>
              </Card>
            </ViewTransition>

            <ViewTransition name="movies-card">
              <Card title="Movies" className="h-full">
                <p className="m-0">Browse and discover new movies</p>
                <Button className="mt-4">Explore</Button>
              </Card>
            </ViewTransition>

            <ViewTransition name="recommendations-card">
              <Card title="Recommendations" className="h-full">
                <p className="m-0">Get personalized movie recommendations</p>
                <Button className="mt-4" outlined>
                  View
                </Button>
              </Card>
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

