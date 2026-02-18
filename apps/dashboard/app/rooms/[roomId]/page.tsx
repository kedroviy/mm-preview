"use client";

import {
  useRoom,
  useUser,
  useChooseMovie,
  useLeaveRoom,
  useRoomMembers,
  type RoomRole,
} from "@mm-preview/sdk";
import { Button, notificationService, Card } from "@mm-preview/ui";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useViewTransition, ViewTransition } from "@/src/shared/components/ViewTransition";
import { ChatWindow } from "@/src/shared/components/ChatWindow";
import { useWebSocketChat } from "@/src/shared/hooks/useWebSocketChat";

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const userId = searchParams.get("userId") || "";

  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const { data: user } = useUser(userId);
  const { data: members } = useRoomMembers(roomId);
  const chooseMovie = useChooseMovie();
  const leaveRoom = useLeaveRoom();
  const { navigate, isPending } = useViewTransition();

  const {
    messages: chatMessages,
    isConnected: isChatConnected,
    isMuted,
    sendMessage: sendChatMessage,
  } = useWebSocketChat({
    roomId,
    publicCode: room?.publicCode,
    userId,
    enabled: !!roomId && room?.isMember && !!userId,
    onError: (error) => {
      console.error("Chat error:", error);
      notificationService.showError(error.message || "Ошибка подключения к чату");
    },
  });

  const handleLeaveRoom = async () => {
    if (!userId || !roomId) return;

    try {
      await leaveRoom.mutateAsync({ roomId, userId });
      notificationService.showSuccess("Вы покинули комнату");
      navigate(`/rooms?userId=${userId}`);
    } catch (error) {
      notificationService.showError("Не удалось покинуть комнату");
    }
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

  if (roomLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Room not found</p>
          <Button
            onClick={() => navigate(`/rooms?userId=${userId}`)}
            className="mt-4"
            disabled={isPending}
          >
            Вернуться к комнатам
          </Button>
        </div>
      </div>
    );
  }

  const isUserInRoom = room.isMember;
  const userChoice = room.choices[userId];
  const userRole = room.currentUserRole;
  const canManage = room.canManage;

  const getRoleLabel = (role?: RoomRole) => {
    switch (role) {
      case "room_creator":
        return "Создатель";
      case "room_member":
        return "Участник";
      default:
        return "";
    }
  };

  return (
    <ViewTransition name="page">
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => navigate(`/rooms?userId=${userId}`)}
              text
              className="mb-4"
              disabled={isPending}
            >
              ← Назад к комнатам
            </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Комната {room.publicCode}</h1>
              <p className="text-muted-color">
                Участников: {room.users.length} | Выборов: {Object.keys(room.choices).length}
                {userRole && ` | Ваша роль: ${getRoleLabel(userRole)}`}
              </p>
            </div>
            {isUserInRoom && (
              <Button
                onClick={handleLeaveRoom}
                disabled={leaveRoom.isPending}
                outlined
              >
                {leaveRoom.isPending ? "Выход..." : "Покинуть комнату"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Участники" className="h-full">
            <div className="flex flex-col gap-2">
              {members && members.length > 0 ? (
                members.map((member) => {
                  const isCurrentUser = member.userId === userId;
                  const memberRole = room.userRoles[member.userId];
                  return (
                    <div
                      key={member.userId}
                      className={`p-2 rounded ${
                        isCurrentUser
                          ? "bg-primary/10 border border-primary"
                          : "bg-surface-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {isCurrentUser ? "Вы" : member.name}
                          </span>
                          <span className="text-xs text-muted-color">
                            {getRoleLabel(memberRole)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {room.choices[member.userId] && (
                            <span className="text-sm text-muted-color">
                              Выбрал фильм
                            </span>
                          )}
                          {canManage && !isCurrentUser && (
                            <Button
                              size="small"
                              severity="danger"
                              text
                              onClick={() => {
                                // TODO: Реализовать удаление пользователя
                                notificationService.showInfo(
                                  "Функция удаления участника будет добавлена",
                                );
                              }}
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-color">Нет участников</p>
              )}
            </div>
          </Card>

          <Card title="Выборы фильмов" className="h-full">
            <div className="flex flex-col gap-2">
              {Object.keys(room.choices).length > 0 ? (
                Object.entries(room.choices).map(([userInRoomId, movieId]) => (
                  <div
                    key={userInRoomId}
                    className="p-2 rounded bg-surface-100"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {userInRoomId === userId ? "Вы" : `User ${userInRoomId.slice(0, 8)}`}
                      </span>
                      <span className="font-medium">{movieId}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-color">Пока нет выборов</p>
              )}
            </div>
          </Card>
        </div>

        {isUserInRoom && (
          <Card title="Ваш выбор" className="mt-6">
            <div className="flex flex-col gap-4">
              {userChoice ? (
                <div>
                  <p className="mb-2">Вы выбрали: <strong>{userChoice}</strong></p>
                  <Button
                    onClick={() => {
                      // TODO: Реализовать изменение выбора
                      notificationService.showInfo("Функция изменения выбора будет добавлена");
                    }}
                    outlined
                  >
                    Изменить выбор
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="mb-4">Выберите фильм для просмотра</p>
                  <Button
                    onClick={() => {
                      // TODO: Реализовать выбор фильма
                      notificationService.showInfo("Функция выбора фильма будет добавлена");
                    }}
                  >
                    Выбрать фильм
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {!isUserInRoom && (
          <Card className="mt-6">
            <p className="text-center text-muted-color mb-4">
              Вы не являетесь участником этой комнаты
            </p>
            <Button
              onClick={() => navigate(`/rooms?userId=${userId}`)}
              className="w-full"
              disabled={isPending}
            >
              Вернуться к комнатам
            </Button>
          </Card>
        )}

        {isUserInRoom && user && (
          <ChatWindow
            roomId={roomId}
            userId={userId}
            userName={user.name}
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            isLoading={!isChatConnected}
            isMuted={isMuted}
          />
        )}
      </div>
    </div>
    </ViewTransition>
  );
}

// Loading state теперь обрабатывается через loading.tsx
// Suspense используется только для useSearchParams
export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomContent />
    </Suspense>
  );
}

