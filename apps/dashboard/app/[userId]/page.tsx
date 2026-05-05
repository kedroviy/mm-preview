"use client";

import { DashboardClient } from "@/src/views/dashboard/ui/DashboardClient";

export default function UserDashboardPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;

  return <DashboardClient userId={userId} initialProfile={null} />;
}
