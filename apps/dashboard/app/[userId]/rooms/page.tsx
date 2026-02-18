import { Suspense } from "react";
import { getMyRoomsServer } from "@/src/views/rooms/model/getMyRoomsServer";
import { RoomsPageClient } from "@/src/views/rooms/ui/RoomsPageClient";

export default async function UserRoomsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Серверный запрос за комнатами
  const initialRooms = await getMyRoomsServer();

  return (
    <Suspense fallback={null}>
      <RoomsPageClient userId={userId} initialRooms={initialRooms} />
    </Suspense>
  );
}
