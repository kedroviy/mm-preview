/**
 * События, которые клиент отправляет на сервер (CLIENT_EVENTS)
 */
export const CLIENT_EVENTS = {
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  CHOOSE_MOVIE: "chooseMovie",
  GET_ROOM: "getRoom",
  GET_MY_ROOMS: "getMyRooms",
  SEND_MESSAGE: "sendMessage",
} as const;

/**
 * События, которые сервер отправляет клиенту (SERVER_EVENTS)
 */
export const SERVER_EVENTS = {
  ERROR: "error",
  TOKEN_REFRESHED: "tokenRefreshed",
  ROOM_CREATED: "roomCreated",
  ROOM_UPDATE: "roomUpdate",
  JOINED_ROOM: "joinedRoom",
  LEFT_ROOM: "leftRoom",
  ROOM_DATA: "roomData",
  MY_ROOMS: "myRooms",
  CHAT_HISTORY: "chatHistory",
  NEW_MESSAGE: "newMessage",
} as const;

/**
 * Типы событий обновления комнаты
 */
export const ROOM_UPDATE_EVENTS = {
  USER_JOINED: "userJoined",
  USER_LEFT: "userLeft",
  MOVIE_CHOSEN: "movieChosen",
  USER_CONNECTED: "userConnected",
  USER_DISCONNECTED: "userDisconnected",
} as const;

export type ClientEventName =
  (typeof CLIENT_EVENTS)[keyof typeof CLIENT_EVENTS];
export type ServerEventName =
  (typeof SERVER_EVENTS)[keyof typeof SERVER_EVENTS];
export type RoomUpdateEventName =
  (typeof ROOM_UPDATE_EVENTS)[keyof typeof ROOM_UPDATE_EVENTS];
