"use client";

import {
  getAccessToken,
  getUserIdFromToken,
  useLeaveRoom,
  useRoom,
  useRoomMembers,
} from "@mm-preview/sdk";
import { Button, notificationService, ProgressSpinner } from "@mm-preview/ui";
import { Suspense, useCallback, useMemo } from "react";
import Loading from "@/app/loading";
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

function RoomContent({ userId, roomId }: RoomDetailPageProps) {
  const tokenUserId = getUserIdFromToken(getAccessToken());
  const effectiveUserId = tokenUserId ?? userId;
  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const { data: members } = useRoomMembers(roomId);
  const leaveRoom = useLeaveRoom();
  const { navigate, isPending } = useViewTransition();

  const {
    messages: chatMessages,
    isConnected: isChatConnected,
    isMuted,
    isReadyToSend,
    sendMessage: sendChatMessage,
  } = useChat({
    roomId,
    publicCode: room?.publicCode,
    userId: effectiveUserId,
    enabled: !!(roomId && room?.isMember && effectiveUserId),
  });

  const handleLeaveRoom = useCallback(async () => {
    if (!effectiveUserId || !roomId || !room?.publicCode) {
      return;
    }

    try {
      await leaveRoom.mutateAsync({ roomId, roomKey: room.publicCode });
      notificationService.showSuccess("Вы покинули комнату");
      navigate(`/${effectiveUserId}/rooms`);
    } catch (_error) {
      notificationService.showError("Не удалось покинуть комнату");
    }
  }, [effectiveUserId, roomId, room?.publicCode, leaveRoom, navigate]);

  const handleBack = useCallback(
    () => navigate(`/${effectiveUserId}/rooms`),
    [navigate, effectiveUserId],
  );
  const handleRemoveMember = useCallback((_memberUserId: string) => {
    notificationService.showInfo("Функция удаления участника будет добавлена");
  }, []);

  const viewConfig: ViewConfig = useMemo(() => {
    if (!effectiveUserId) {
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
              <ProgressSpinner aria-label="Loading room" />
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
              <ChatWindow
                userId={effectiveUserId}
                messages={chatMessages}
                onSendMessage={sendChatMessage}
                isLoading={!isChatConnected || !isReadyToSend}
                isMuted={isMuted}
              />
            </div>
          </div>
        </ViewTransition>
      ),
    };
  }, [
    effectiveUserId,
    roomLoading,
    room,
    members,
    chatMessages,
    isChatConnected,
    isMuted,
    sendChatMessage,
    leaveRoom.isPending,
    isPending,
    handleBack,
    handleLeaveRoom,
    handleRemoveMember,
  ]);

  return viewConfig.render();
}

export function RoomDetailPage({ userId, roomId }: RoomDetailPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <RoomContent userId={userId} roomId={roomId} />
    </Suspense>
  );
}
