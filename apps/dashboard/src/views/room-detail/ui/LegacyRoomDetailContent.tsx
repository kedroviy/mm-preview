"use client";

import type { RoomMember } from "@mm-preview/sdk";
import { useUsersController_getProfile } from "@mm-preview/sdk";
import {
  Button,
  Card,
  notificationService,
  ProgressSpinner,
} from "@mm-preview/ui";
import { useCallback, useMemo } from "react";
import {
  useViewTransition,
  ViewTransition,
} from "@/src/shared/components/ViewTransition";
import {
  useMovieMatchLeaveRoom,
  useMovieMatchRoom,
} from "@/src/shared/hooks/useMovieMatchRooms";
import { RoomChoices } from "@/src/widgets/room-choices";
import { RoomHeader } from "@/src/widgets/room-header";
import { RoomMembers } from "@/src/widgets/room-members";
import { RoomNotMember } from "@/src/widgets/room-not-member";

type ProfileType = {
  userId: string;
  name: string;
};

interface LegacyRoomDetailContentProps {
  userId: string;
  roomId: string;
}

export function LegacyRoomDetailContent({
  userId,
  roomId,
}: LegacyRoomDetailContentProps) {
  const {
    data: room,
    isLoading: roomLoading,
    isError,
  } = useMovieMatchRoom(roomId, userId);
  const { data: profileData } = useUsersController_getProfile();
  const profile = profileData as ProfileType | null | undefined;
  const leaveRoom = useMovieMatchLeaveRoom();
  const { navigate, isPending } = useViewTransition();

  const members = useMemo<RoomMember[]>(() => [], []);

  const handleLeaveRoom = useCallback(async () => {
    if (!room?.publicCode) {
      return;
    }
    try {
      await leaveRoom.mutateAsync(room.publicCode);
      notificationService.showSuccess("Вы покинули комнату");
      navigate(`/${userId}/rooms`);
    } catch (_error) {
      notificationService.showError("Не удалось покинуть комнату");
    }
  }, [userId, room, leaveRoom, navigate]);

  const handleBack = useCallback(
    () => navigate(`/${userId}/rooms`),
    [navigate, userId],
  );

  const handleRemoveMember = useCallback((_memberUserId: string) => {
    notificationService.showInfo("Функция удаления участника будет добавлена");
  }, []);

  const viewConfig = useMemo(() => {
    if (!userId) {
      return {
        render: () => (
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-color">User ID is required</p>
            </div>
          </div>
        ),
      };
    }

    if (roomLoading) {
      return {
        render: () => (
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="text-center">
              <ProgressSpinner aria-label="Loading room" />
            </div>
          </div>
        ),
      };
    }

    if (isError || !room) {
      return {
        render: () => (
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-red-600">Комната не найдена</p>
              <Button
                onClick={handleBack}
                className="mt-4"
                disabled={isPending}
              >
                Вернуться к комнатам
              </Button>
            </div>
          </div>
        ),
      };
    }

    if (!room.isMember) {
      return {
        render: () => (
          <ViewTransition name="page">
            <div className="min-h-screen p-8">
              <div className="max-w-4xl mx-auto">
                <RoomHeader
                  room={room}
                  userRole={room.currentUserRole}
                  onBack={handleBack}
                  onLeave={handleLeaveRoom}
                  isLeaving={leaveRoom.isPending}
                  isPending={isPending}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RoomMembers
                    room={room}
                    members={members}
                    currentUserId={userId}
                    canManage={room.canManage}
                    onRemoveMember={handleRemoveMember}
                  />
                  <RoomChoices room={room} currentUserId={userId} />
                </div>
                <RoomNotMember onBack={handleBack} isPending={isPending} />
              </div>
            </div>
          </ViewTransition>
        ),
      };
    }

    return {
      render: () => (
        <ViewTransition name="page">
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
              <RoomHeader
                room={room}
                userRole={room.currentUserRole}
                onBack={handleBack}
                onLeave={handleLeaveRoom}
                isLeaving={leaveRoom.isPending}
                isPending={isPending}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RoomMembers
                  room={room}
                  members={members}
                  currentUserId={userId}
                  canManage={room.canManage}
                  onRemoveMember={handleRemoveMember}
                />
                <RoomChoices room={room} currentUserId={userId} />
              </div>
              <Card title="Чат" className="mt-6">
                <p className="text-muted-color m-0">
                  В режиме API movieMatcher используется другой протокол чата;
                  окно чата нового бэкенда отключено.
                </p>
                {profile && (
                  <p className="text-sm text-muted-color mt-2 mb-0">
                    Пользователь: {profile.userId}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </ViewTransition>
      ),
    };
  }, [
    userId,
    roomLoading,
    isError,
    room,
    members,
    profile,
    leaveRoom.isPending,
    isPending,
    handleBack,
    handleLeaveRoom,
    handleRemoveMember,
  ]);

  return viewConfig.render();
}
