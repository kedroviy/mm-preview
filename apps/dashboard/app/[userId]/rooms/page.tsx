"use client";

import { RoomsPageClient } from "@/src/views/rooms/ui/RoomsPageClient";

export default function UserRoomsPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;

  return <RoomsPageClient userId={userId} initialRooms={[]} />;
}
