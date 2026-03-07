import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.moviematch.space";

/**
 * Server-side refresh proxy.
 * Calls the backend directly (server-to-server), forwarding the refresh_token cookie.
 * Returns { accessToken } in the JSON body so the client always gets the token
 * regardless of cross-domain Set-Cookie propagation through Vercel rewrites.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 },
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Refresh failed" },
        { status: backendRes.status },
      );
    }

    const body = await backendRes.json().catch(() => ({}));
    let accessToken: string | null = body?.accessToken ?? body?.data?.accessToken ?? null;

    if (!accessToken) {
      const setCookieHeaders = backendRes.headers.getSetCookie?.() ?? [];
      for (const header of setCookieHeaders) {
        const match = header.match(/access_token=([^;]+)/);
        if (match?.[1]) {
          accessToken = match[1];
          break;
        }
      }
    }

    const response = NextResponse.json({ accessToken });

    const setCookieHeaders = backendRes.headers.getSetCookie?.() ?? [];
    for (const header of setCookieHeaders) {
      response.headers.append("Set-Cookie", header);
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Refresh request failed" },
      { status: 502 },
    );
  }
}
