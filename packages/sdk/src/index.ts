// API Client
export { createApiClient, api } from "./client";
export type { ApiError, ApiResponse, RequestConfig } from "./types";

// Query Client
export { createQueryClient, defaultQueryClient } from "./query-client";

// Services
export { usersApi } from "./services/users";
export type { User, CreateUserRequest, UpdateUserRequest } from "./services/users";

// Hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  userKeys,
} from "./hooks/useUsers";

