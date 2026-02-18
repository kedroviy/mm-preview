// API Client
export { api, createApiClient } from "./client";
// Rooms
export {
  roomKeys,
  useChatHistory,
  useChooseMovie,
  useCreateRoom,
  useJoinRoom,
  useLeaveRoom,
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
export { decodeJWT, getUserIdFromToken } from "./utils/jwt";

// Server-side exports are not included in main index to avoid importing next/headers in client code
// Use direct fetch in server components instead

export * from "./generated/hooks";
export * from "./generated/requests";
// Generated exports (will be available after running generate:all)
export * from "./generated/types";
