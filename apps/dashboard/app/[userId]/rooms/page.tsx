import { createServerClient, getProfileOptions } from "@mm-preview/sdk";
import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Room } from "@/src/entities/room";
import { isMovieMatchLegacy } from "@/src/shared/movie-match/config";
import { membershipToDashboardRoom } from "@/src/shared/movie-match/map-room";
import { movieMatchGetMyMembershipsOnServer } from "@/src/shared/movie-match/server-fetch";
import { RoomsPageClient } from "@/src/views/rooms/ui/RoomsPageClient";

export default async function UserRoomsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  let initialRooms: Room[] = [];

  if (accessToken && isMovieMatchLegacy()) {
    try {
      const memberships = await movieMatchGetMyMembershipsOnServer(accessToken);
      initialRooms = memberships.map(membershipToDashboardRoom);
    } catch (error) {
      console.error(
        "[rooms page] Error fetching movieMatcher memberships:",
        error,
      );
    }
  } else if (accessToken) {
    const client = createServerClient();
    const queryClient = new QueryClient();
    try {
      await queryClient.prefetchQuery({
        ...getProfileOptions({
          client,
          credentials: "include",
          headers: {
            Cookie: cookieStore.toString(),
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      });
      const profile = queryClient.getQueryData<{ rooms?: Room[] }>([
        "users",
        "getProfile",
      ]);
      initialRooms = (profile?.rooms as Room[]) || [];
    } catch (error) {
      console.error("[rooms page] Error fetching profile:", error);
    }
  }

  return (
    <Suspense fallback={null}>
      <RoomsPageClient userId={userId} initialRooms={initialRooms} />
    </Suspense>
  );
}
