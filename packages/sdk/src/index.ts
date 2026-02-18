// API Client
export { api, createApiClient } from "./client";

// Query Client
export { createQueryClient, defaultQueryClient } from "./query-client";

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

// Auth
export { authApi } from "./services/auth";
export type { AuthResponse, RefreshTokenRequest } from "./services/auth";

// Legacy exports (for backward compatibility)
export {
  useCreateUser,
  userKeys,
  useUpdateUserName,
  useUser,
  useUsers,
} from "./hooks/useUsers";
export type { CreateUserRequest, User } from "./services/users";
export { usersApi } from "./services/users";

// Rooms
export {
  useChooseMovie,
  useCreateRoom,
  useJoinRoom,
  useLeaveRoom,
  useRoom,
  useRoomMembers,
  useRemoveUserFromRoom,
  useChatHistory,
  roomKeys,
} from "./hooks/useRooms";
export type {
  ChooseMovieRequest,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  LeaveRoomRequest,
  Room,
  RoomRole,
  RoomMember,
  ChatMessage,
  SendChatMessageRequest,
} from "./services/rooms";
export { roomsApi } from "./services/rooms";

// Generated exports (will be available after running generate:all)
// Uncomment after first generation:
// export * from "./generated/types";
// export * from "./generated/requests";
// export * from "./generated/hooks";
