// API Client
export { api, createApiClient } from "./client";
export { TokenSync } from "./components/TokenSync";
// Rooms
export {
  roomKeys,
  useChatHistory,
  useChooseMovie,
  useCreateRoom,
  useJoinRoom,
  useLeaveRoom,
  useMyRooms,
  useRemoveUserFromRoom,
  useRoom,
  useRoomMembers,
} from "./hooks/useRooms";
// Legacy exports (for backward compatibility)
export {
  useCreateUser,
  userKeys,
  useUpdateUserName,
  useUser,
  useUsers,
} from "./hooks/useUsers";
// Query Client
export { createQueryClient, defaultQueryClient } from "./query-client";
export type { AuthResponse, RefreshTokenRequest } from "./services/auth";
// Auth
export { authApi } from "./services/auth";
export type {
  ChatMessage,
  ChooseMovieRequest,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  LeaveRoomRequest,
  Room,
  RoomMember,
  RoomRole,
  SendChatMessageRequest,
} from "./services/rooms";
export { roomsApi } from "./services/rooms";
export type { CreateUserRequest, User } from "./services/users";
export { usersApi } from "./services/users";
// Types
export type { ApiError, ApiResponse, RequestConfig } from "./types";
export {
  getClientApiUrl,
  getServerApiUrl,
  getWebSocketRoomsUrl,
  getWebSocketUrl,
} from "./utils/api-url";
export {
  getCookieDomain,
  getSameSiteConfig,
  isAllowedDomain,
  isAllowedUrl,
  shouldUseSameSiteNone,
} from "./utils/cookie-config";
// Utils
export {
  deleteCookie,
  getAccessToken,
  getCookie,
  getRefreshToken,
  removeAccessToken,
  removeAllAuthTokens,
  removeRefreshToken,
  setAccessToken,
  setCookie,
} from "./utils/cookies";
export { getEnvMode, isDevelopment, isProduction } from "./utils/env-mode";
export { decodeJWT, getUserIdFromToken } from "./utils/jwt";
export {
  getTokensFromStorage,
  removeTokensFromStorage,
  saveTokensToStorage,
  syncTokensFromCookiesToStorage,
  syncTokensFromStorageToCookies,
} from "./utils/token-sync";
export type {
  WebSocketErrorPayload,
  WebSocketServiceEvents,
  WsError,
  WsErrorCode,
} from "./websocket";
export {
  CLIENT_EVENTS,
  ROOM_UPDATE_EVENTS,
  SERVER_EVENTS,
  WebSocketErrorHandler,
  WebSocketService,
  WS_ERROR_CODES,
  webSocketService,
} from "./websocket";

// Server-side exports are not included in main index to avoid importing next/headers in client code
// Use direct fetch in server components instead

export * from "./generated/hooks";
export * from "./generated/requests";
// Generated exports (will be available after running generate:all)
export * from "./generated/types";
