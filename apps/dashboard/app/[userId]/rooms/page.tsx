import { cookies } from "next/headers";
import { Suspense } from "react";
import { RoomsPageClient } from "@/src/views/rooms/ui/RoomsPageClient";
import type { Room } from "@/src/entities/room";

async function getProfileFromServer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  if (!accessToken?.value) {
    return null;
  }

  try {
    // Формируем строку кук
    const cookieString = [
      accessToken ? `access_token=${accessToken.value}` : "",
      refreshToken ? `refresh_token=${refreshToken.value}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    // Делаем запрос к профилю с токеном в Authorization и Cookie
    const origin =
      process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";
    const response = await fetch(`${apiUrl}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // biome-ignore lint/style/useNamingConvention: HTTP headers must be capitalized
        Authorization: `Bearer ${accessToken.value}`,
        // biome-ignore lint/style/useNamingConvention: HTTP headers must be capitalized
        Cookie: cookieString,
        // biome-ignore lint/style/useNamingConvention: HTTP headers must be capitalized
        Origin: origin,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      const profile = await response.json();
      return profile;
    }
  } catch (error) {
    console.error("[rooms page] Error fetching profile:", error);
  }

  return null;
}

export default async function UserRoomsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Получаем профиль на сервере, из которого извлекаем комнаты
  const profile = await getProfileFromServer();
  const initialRooms = (profile?.rooms as Room[]) || [];

  return (
    <Suspense fallback={null}>
      <RoomsPageClient userId={userId} initialRooms={initialRooms} />
    </Suspense>
  );
}
