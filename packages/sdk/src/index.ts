// API Client
export { api, createApiClient } from "./client";
// Hooks
export {
  useCreateUser,
  useDeleteUser,
  userKeys,
  useUpdateUser,
  useUser,
  useUsers,
} from "./hooks/useUsers";

// Query Client
export { createQueryClient, defaultQueryClient } from "./query-client";
export type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "./services/users";
// Services
export { usersApi } from "./services/users";
export type { ApiError, ApiResponse, RequestConfig } from "./types";
