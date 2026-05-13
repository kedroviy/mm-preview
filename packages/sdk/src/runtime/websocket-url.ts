import { getPublicApiBaseUrl } from "./public-api-url";

/**
 * Socket.IO base URL for rooms/chat. Prefer `NEXT_PUBLIC_WS_URL`; otherwise reuse API origin.
 */
export function getWebSocketRoomsUrl(): string {
	const raw =
		(typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) ||
		getPublicApiBaseUrl();
	return raw.replace(/\/$/, "");
}
