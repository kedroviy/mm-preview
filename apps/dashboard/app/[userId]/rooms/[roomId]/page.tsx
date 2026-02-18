import { RoomDetailPage } from "@/src/pages/room-detail/ui/RoomDetailPage";

export default async function UserRoomDetailPage({
  params,
}: {
  params: Promise<{ userId: string; roomId: string }>;
}) {
  const { userId, roomId } = await params;

  return <RoomDetailPage userId={userId} roomId={roomId} />

}

