import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/token
 *
 * Reads the HttpOnly access_token cookie on the server and returns its value
 * to the client. This is the only safe way to pass an HttpOnly token to
 * client-side code (e.g. Socket.IO auth).
 *
 * The response is intentionally NOT cached so the client always gets the
 * current token (which may be refreshed by the backend at any time).
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? null;

  return NextResponse.json(
    { accessToken },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
