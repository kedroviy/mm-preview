"use client";

import {
  getAccessToken,
  getRoomsControllerGetRoomStateQueryKey,
  getUserIdFromToken,
  useLeaveRoom,
  useRoom,
  useRoomMembers,
} from "@mm-preview/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { Button, notificationService, ProgressSpinner } from "@mm-preview/ui";
import { Suspense, useCallback, useMemo } from "react";
import Loading from "@/app/loading";
import { ChatWindow, useChat } from "@/src/features/chat";
import { RoomJoinBanner, RoomMatchPanel } from "@/src/features/match";
import {
  useViewTransition,
  ViewTransition,
} from "@/src/shared/components/ViewTransition";
import { RoomHeader } from "@/src/widgets/room-header";
import { RoomMembers } from "@/src/widgets/room-members";

type ViewConfig = {
  view: "loading" | "error" | "not-member" | "member";
  render: () => React.ReactElement | null;
};

interface RoomDetailPageProps {
  userId: string;
  roomId: string;
}

function RoomContent({ userId, roomId }: RoomDetailPageProps) {
  const queryClient = useQueryClient();
  const tokenUserId = getUserIdFromToken(getAccessToken());
  const effectiveUserId = tokenUserId ?? userId;
  const { data: room, isLoading: roomLoading, refetch: refetchRoom } = useRoom(roomId);
  const { data: members } = useRoomMembers(roomId);
  const leaveRoom = useLeaveRoom();
  const { navigate, isPending } = useViewTransition();

  const isMember = room?.isMember ?? false;

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
    enabled: !!(roomId && isMember && effectiveUserId),
  });

  const handleLeaveRoom = useCallback(async () => {
    if (!effectiveUserId || !roomId || !room?.publicCode) {
      return;
    }

    try {
      await leaveRoom.mutateAsync({
        roomKey: room.publicCode,
        userId: Number(effectiveUserId),
      });
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

  const handleJoinedRoom = useCallback(() => {
    if (room?.publicCode) {
      queryClient.invalidateQueries({
        queryKey: getRoomsControllerGetRoomStateQueryKey(room.publicCode),
      });
    }
    void refetchRoom();
  }, [queryClient, room?.publicCode, refetchRoom]);

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

    const memberId = effectiveUserId;

    return {
      view: isMember ? "member" : "not-member",
      render: () => (
        <ViewTransition name="page">
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              <RoomHeader
                room={room}
                userRole={room.currentUserRole}
                onBack={handleBack}
                onLeave={handleLeaveRoom}
                isLeaving={leaveRoom.isPending}
                isPending={isPending}
              />

              {!isMember && room.publicCode ? (
                <RoomJoinBanner
                  publicCode={room.publicCode}
                  userId={effectiveUserId}
                  onJoined={handleJoinedRoom}
                />
              ) : null}

              <RoomMatchPanel
                room={room}
                userId={effectiveUserId}
                onBackToRooms={handleBack}
              />

              <RoomMembers
                room={room}
                members={members}
                currentUserId={memberId}
                canManage={room.canManage}
                onRemoveMember={handleRemoveMember}
              />

              {isMember ? (
                <ChatWindow
                  userId={effectiveUserId}
                  messages={chatMessages}
                  onSendMessage={sendChatMessage}
                  isLoading={!isChatConnected || !isReadyToSend}
                  isMuted={isMuted}
                />
              ) : null}
            </div>
          </div>
        </ViewTransition>
      ),
    };
  }, [
    effectiveUserId,
    roomLoading,
    room,
    isMember,
    members,
    chatMessages,
    isChatConnected,
    isMuted,
    sendChatMessage,
    leaveRoom.isPending,
    isPending,
    handleBack,
    handleLeaveRoom,
    handleJoinedRoom,
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
