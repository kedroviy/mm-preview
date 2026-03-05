import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Room } from "@/src/entities/room";
import { DashboardClient } from "@/src/views/dashboard/ui/DashboardClient";
import { createServerClient, getProfileOptions } from "@mm-preview/sdk";

async function buildServerClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return null;

  const client = createServerClient();
  const cookieString = cookieStore.toString();

  return {
    client,
    headers: {
      Cookie: cookieString,
      Authorization: `Bearer ${accessToken}`,
    } as HeadersInit,
  };
}

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const ctx = await buildServerClient();

  let initialProfile = null;

  if (ctx) {
    const queryClient = new QueryClient();
    try {
      await queryClient.prefetchQuery({
        ...getProfileOptions({
          client: ctx.client,
          credentials: "include",
          headers: ctx.headers,
        }),
      });

      initialProfile = queryClient.getQueryData<{
        userId: string;
        name: string;
        role?: string;
        lastActive?: number;
        recentRooms?: string[];
        rooms?: Room[];
      }>(["users", "getProfile"]) ?? null;
    } catch (error) {
      console.error("[dashboard page] Profile prefetch failed:", error);
    }
  }

  return (
    <Suspense fallback={null}>
      <DashboardClient userId={userId} initialProfile={initialProfile} />
    </Suspense>
  );
}
