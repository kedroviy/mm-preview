/** Runtime helpers */
export { getClientApiUrl, getPublicApiBaseUrl } from "./runtime/public-api-url";
export { decodeJWT, getCookieDomain } from "./runtime/token-utils";
export {
	createServerQueryClient,
	defaultQueryClient,
	queryClientDefaultOptions,
} from "./query-client";

export {
	getAccessToken,
	getUserIdFromToken,
	removeAllAuthTokens,
} from "./runtime/auth-tokens";
export { getWebSocketRoomsUrl } from "./runtime/websocket-url";
export { authApi } from "./runtime/auth-api";
export {
	webSocketService,
	type WebSocketServiceEvents,
} from "./runtime/websocket-service";

/** Dashboard wrappers + domain types (Room, ChatMessage, …). */
export * from "./dashboard-compat";

/** OpenAPI + TanStack Query (Orval). Regenerate with `npm run sdk:generate` from repo root. */
export * from "./generated/orval/api";
