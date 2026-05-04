import { getMovieMatchBaseUrl } from "./config";
import type { UserRoomMembership } from "./types";

export async function movieMatchGetMyMembershipsOnServer(
  accessToken: string | undefined,
): Promise<UserRoomMembership[]> {
  if (!accessToken) {
    return [];
  }
  const base = getMovieMatchBaseUrl();
  const res = await fetch(`${base}/rooms/my/memberships`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    return [];
  }
  const body = (await res.json()) as unknown;
  if (Array.isArray(body)) {
    return body as UserRoomMembership[];
  }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return (body as { data: UserRoomMembership[] }).data;
  }
  return [];
}
