"use client";

import { useEffect } from "react";
import { DashboardClient } from "@/src/views/dashboard/ui/DashboardClient";
import { getAccessToken, getUserIdFromToken } from "@mm-preview/sdk";

export default function UserDashboardPage({
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
      window.location.replace(`/${tokenUserId}`);
    }
  }, [userId]);

  return <DashboardClient userId={userId} initialProfile={null} />;
}
