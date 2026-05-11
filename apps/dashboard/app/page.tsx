import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAppUrls } from "@/src/shared/config/constants";

export const runtime = "nodejs";

function getUserIdFromAccessToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  // JWT uses base64url. Normalize to standard base64.
  const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

  try {
    const padded =
      base64Payload + "=".repeat((4 - (base64Payload.length % 4)) % 4);

    // Next server components run in Node.js by default.
    const json = Buffer.from(padded, "base64").toString("utf8");
    const decoded = JSON.parse(json) as Record<string, unknown>;

    const raw = decoded.userId ?? decoded.sub ?? decoded.id;
    if (raw === undefined || raw === null) return null;

    return typeof raw === "string" || typeof raw === "number" ? String(raw) : null;
  } catch {
    return null;
  }
}

export default async function DashboardRootPage() {
  const urls = getAppUrls();

  const cookieStore = await cookies();
  const accessTokenCookie = cookieStore.get("access_token")?.value;

  const accessToken = accessTokenCookie
    ? decodeURIComponent(accessTokenCookie)
    : null;

  const userId = accessToken ? getUserIdFromAccessToken(accessToken) : null;
  if (!userId) {
    redirect(`${urls.USER_CREATION}/auth/login`);
  }

  redirect(`/${userId}`);
}
