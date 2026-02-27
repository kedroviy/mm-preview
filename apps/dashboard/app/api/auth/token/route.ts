import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Returns the access_token from HttpOnly cookie so the client can pass it
 * to the WebSocket handshake (cross-domain: onrender.com ≠ moviematch.space,
 * so cookies are not sent automatically by the browser).
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? null;
  return NextResponse.json({ accessToken });
}
