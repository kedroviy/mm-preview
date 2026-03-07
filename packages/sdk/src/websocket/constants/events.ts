/**
 * WebSocket Events Configuration
 * Declarative configuration for all WebSocket events (aligned with backend)
 */

/**
 * Client-to-Server events (events that clients send to the server)
 */
export const CLIENT_EVENTS = {
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  CHOOSE_MOVIE: "chooseMovie",
  GET_ROOM: "getRoom",
  GET_MY_ROOMS: "getMyRooms",
  SEND_MESSAGE: "sendMessage",
  UPDATE_ROOM_MEMBERS: "updateRoomMembers",
} as const;

/**
 * Server-to-Client events (events that server sends to clients)
 */
export const SERVER_EVENTS = {
  ERROR: "error",
  TOKEN_REFRESHED: "tokenRefreshed",
  ROOM_CREATED: "roomCreated",
  ROOM_UPDATE: "roomUpdate",
  ROOM_DATA: "roomData",
  JOINED_ROOM: "joinedRoom",
  LEFT_ROOM: "leftRoom",
  MY_ROOMS: "myRooms",
  CHAT_HISTORY: "chatHistory",
  NEW_MESSAGE: "newMessage",
} as const;

/**
 * Room update event types (used in roomUpdate event)
 */
export const ROOM_UPDATE_EVENTS = {
  /** Пользователь намеренно вошёл в комнату (joinRoom) */
  USER_JOINED: "userJoined",
  /** Пользователь намеренно вышел из комнаты (leaveRoom) */
  USER_LEFT: "userLeft",
  /** Пользователь выбрал фильм */
  MOVIE_CHOSEN: "movieChosen",
  /** Пользователь заглушён в комнате */
  USER_MUTED: "userMuted",
  /** Пользователь разглушён в комнате */
  USER_UNMUTED: "userUnmuted",
  /** WebSocket-сокет пользователя подключился (он онлайн в комнате) */
  USER_CONNECTED: "userConnected",
  /** Последний WebSocket-сокет пользователя отключился (он оффлайн, но остаётся участником) */
  USER_DISCONNECTED: "userDisconnected",
  /** Пользователь удалён из комнаты */
  USER_REMOVED: "userRemoved",
} as const;

export type ClientEventName =
  (typeof CLIENT_EVENTS)[keyof typeof CLIENT_EVENTS];
export type ServerEventName =
  (typeof SERVER_EVENTS)[keyof typeof SERVER_EVENTS];
export type RoomUpdateEventName =
  (typeof ROOM_UPDATE_EVENTS)[keyof typeof ROOM_UPDATE_EVENTS];
