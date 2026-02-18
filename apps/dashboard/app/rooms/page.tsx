import { Suspense } from "react";
import { getMyRoomsServer } from "@/src/pages/rooms/model/getMyRoomsServer";
import { RoomsPageClient } from "@/src/pages/rooms/ui/RoomsPageClient";

export default async function RoomsPage() {
  // Серверный запрос за комнатами
  const initialRooms = await getMyRoomsServer();

  return (
    <Suspense fallback={null}>
      <RoomsPageClient initialRooms={initialRooms} />
    </Suspense>
  );
}
