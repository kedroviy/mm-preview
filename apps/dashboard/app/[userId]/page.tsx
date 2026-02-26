import { cookies } from "next/headers";
import { Suspense } from "react";
import { DashboardClient } from "@/src/views/dashboard/ui/DashboardClient";

async function getProfileFromServer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");
  const { getServerApiUrl } = await import("@mm-preview/sdk");
  const apiUrl = getServerApiUrl();

  if (!accessToken?.value) {
    return null;
  }

  try {
    const cookieString = [
      `access_token=${accessToken.value}`,
      refreshToken ? `refresh_token=${refreshToken.value}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    const response = await fetch(`${apiUrl}/api/v1/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // biome-ignore lint/style/useNamingConvention: HTTP headers must be capitalized
        Authorization: `Bearer ${accessToken.value}`,
        // biome-ignore lint/style/useNamingConvention: HTTP headers must be capitalized
        Cookie: cookieString,
      },
      cache: "no-store",
    });

    if (response.ok) {
      const profile = await response.json();
      return profile;
    }

    console.error(
      "[dashboard page] Profile fetch failed:",
      response.status,
      await response.text().catch(() => ""),
    );
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

  const initialProfile = await getProfileFromServer();

  return (
    <Suspense fallback={null}>
      <DashboardClient userId={userId} initialProfile={initialProfile} />
    </Suspense>
  );
}
