"use client";

import {
  useLeaveRoom,
  useRoom,
  useRoomMembers,
  useUsersController_getProfile,
} from "@mm-preview/sdk";
import { Button, notificationService } from "@mm-preview/ui";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { ChatWindow, useChat } from "@/src/features/chat";
import {
  useViewTransition,
  ViewTransition,
} from "@/src/shared/components/ViewTransition";
import { RoomChoices } from "@/src/widgets/room-choices";
import { RoomHeader } from "@/src/widgets/room-header";
import { RoomMembers } from "@/src/widgets/room-members";
import { RoomNotMember } from "@/src/widgets/room-not-member";

type ViewConfig = {
  view: "loading" | "error" | "not-member" | "member";
  render: () => React.ReactElement | null;
};

interface RoomDetailPageProps {
  userId: string;
  roomId: string;
}

type ProfileType = {
  userId: string;
  name: string;
  role?: string;
  lastActive?: number;
  recentRooms?: string[];
  rooms?: unknown[];
};

function RoomContent({ userId, roomId }: RoomDetailPageProps) {
  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const { data: profileData } = useUsersController_getProfile();
  const profile = profileData as ProfileType | null | undefined;
  const { data: members } = useRoomMembers(roomId);
  const leaveRoom = useLeaveRoom();
  const { navigate, isPending } = useViewTransition();

  const {
    messages: chatMessages,
    isConnected: isChatConnected,
    isMuted,
    sendMessage: sendChatMessage,
  } = useChat({
    roomId,
    publicCode: room?.publicCode,
    userId,
    enabled: !!(roomId && room?.isMember && userId),
  });

  const handleLeaveRoom = useCallback(async () => {
    if (!userId || !roomId) return;

    try {
      await leaveRoom.mutateAsync({ roomId, userId });
      notificationService.showSuccess("Вы покинули комнату");
      navigate(`/${userId}/rooms`);
    } catch (error) {
      notificationService.showError("Не удалось покинуть комнату");
    }
  }, [userId, roomId, leaveRoom, navigate]);

  const handleBack = useCallback(
    () => navigate(`/${userId}/rooms`),
    [navigate, userId],
  );
  const handleRemoveMember = useCallback((memberUserId: string) => {
    notificationService.showInfo("Функция удаления участника будет добавлена");
  }, []);

  const viewConfig: ViewConfig = useMemo(() => {
    if (!userId) {
      return {
        view: "error",
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
        view: "loading",
        render: () => (
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg">Loading room...</p>
            </div>
          </div>
        ),
      };
    }

    if (!room) {
      return {
        view: "error",
        render: () => (
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-red-600">Room not found</p>
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
        view: "not-member",
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
      view: "member",
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
              {profile && (
                <ChatWindow
                  userId={profile.userId}
                  messages={chatMessages}
                  onSendMessage={sendChatMessage}
                  isLoading={!isChatConnected}
                  isMuted={isMuted}
                />
              )}
            </div>
          </div>
        </ViewTransition>
      ),
    };
  }, [
    userId,
    roomLoading,
    room,
    members,
    profile,
    chatMessages,
    isChatConnected,
    isMuted,
    sendChatMessage,
    leaveRoom.isPending,
    isPending,
    handleBack,
    handleLeaveRoom,
    handleRemoveMember,
    navigate,
  ]);

  return viewConfig.render();
}

export function RoomDetailPage({ userId, roomId }: RoomDetailPageProps) {
  return (
    <Suspense fallback={null}>
      <RoomContent userId={userId} roomId={roomId} />
    </Suspense>
  );
}
