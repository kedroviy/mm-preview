// movie-match room REST API differs from the old OpenAPI spec.
// Use `roomsApi` from `@mm-preview/sdk` (see `src/services/rooms.ts`) instead of these hooks.
import type { Client } from "../../types";

function notSupported(name: string): never {
  throw new Error(
    `${name} is not wired to movie-match; use roomsApi from @mm-preview/sdk/src/services/rooms.ts`,
  );
}

export function createRoomOptions(_config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "createRoom"] as const,
    mutationFn: async () => notSupported("createRoomOptions"),
  };
}

export function getMyRoomsOptions(_config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["rooms", "getMyRooms"] as const,
    queryFn: async () => notSupported("getMyRoomsOptions"),
  };
}

export function getRoomOptions(_config: {
  client: Client;
  path: { id: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["rooms", "getRoom", _config.path] as const,
    queryFn: async () => notSupported("getRoomOptions"),
  };
}

export function joinRoomOptions(_config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "joinRoom"] as const,
    mutationFn: async () => notSupported("joinRoomOptions"),
  };
}

export function leaveRoomOptions(_config: {
  client: Client;
  path: { id: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "leaveRoom", _config.path] as const,
    mutationFn: async () => notSupported("leaveRoomOptions"),
  };
}

export function chooseMovieOptions(_config: {
  client: Client;
  path: { id: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "chooseMovie", _config.path] as const,
    mutationFn: async () => notSupported("chooseMovieOptions"),
  };
}

export function getRoomMembersOptions(_config: {
  client: Client;
  path: { id: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["rooms", "getRoomMembers", _config.path] as const,
    queryFn: async () => notSupported("getRoomMembersOptions"),
  };
}

export function removeUserFromRoomOptions(_config: {
  client: Client;
  path: { id: string; userId: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "removeUserFromRoom", _config.path] as const,
    mutationFn: async () => notSupported("removeUserFromRoomOptions"),
  };
}

export function getChatHistoryOptions(_config: {
  client: Client;
  path: { id: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["rooms", "getChatHistory", _config.path] as const,
    queryFn: async () => notSupported("getChatHistoryOptions"),
  };
}

export function muteUserOptions(_config: {
  client: Client;
  path: { id: string; userId: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "muteUser", _config.path] as const,
    mutationFn: async () => notSupported("muteUserOptions"),
  };
}

export function unmuteUserOptions(_config: {
  client: Client;
  path: { id: string; userId: string };
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    mutationKey: ["rooms", "unmuteUser", _config.path] as const,
    mutationFn: async () => notSupported("unmuteUserOptions"),
  };
}
