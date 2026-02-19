import { cookies } from "next/headers";
import { Suspense } from "react";
import { DashboardClient } from "@/src/views/dashboard/ui/DashboardClient";

async function getProfileFromServer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");
  // Server component - используем прямой URL (не прокси)
  const { getServerApiUrl } = await import("@mm-preview/sdk");
  const apiUrl = getServerApiUrl();

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
    // Для серверных запросов добавляем Origin заголовок
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
    console.error("[dashboard page] Error fetching profile:", error);
  }

  return null;
}

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Серверный запрос профиля
  const initialProfile = await getProfileFromServer();

  return (
    <Suspense fallback={null}>
      <DashboardClient userId={userId} initialProfile={initialProfile} />
    </Suspense>
  );
}
