"use client";

import { useEffect } from "react";
import { getAccessToken, getUserIdFromToken } from "@mm-preview/sdk";
import { RoomsPageClient } from "@/src/views/rooms/ui/RoomsPageClient";

export default function UserRoomsPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;

  useEffect(() => {
    const token = getAccessToken();
    const tokenUserId = getUserIdFromToken(token);
    if (!tokenUserId) {
      const url = process.env.NEXT_PUBLIC_USER_CREATION_URL;
      if (url) window.location.href = url;
      return;
    }
    if (tokenUserId !== userId) {
      window.location.replace(`/${tokenUserId}/rooms`);
    }
  }, [userId]);

  return <RoomsPageClient userId={userId} initialRooms={[]} />;
}
