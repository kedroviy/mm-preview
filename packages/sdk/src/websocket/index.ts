export type { WsError, WsErrorCode } from "./constants/errors";
export { WS_ERROR_CODES } from "./constants/errors";
export type {
  ClientEventName,
  RoomUpdateEventName,
  ServerEventName,
} from "./constants/events";
export {
  CLIENT_EVENTS,
  ROOM_UPDATE_EVENTS,
  SERVER_EVENTS,
} from "./constants/events";
export type {
  ChatHistoryMessage,
  ChatMessage,
  ErrorMessage,
  JoinedRoomMessage,
  LeftRoomMessage,
  MyRoomsMessage,
  NewMessageMessage,
  RoomCreatedMessage,
  RoomDataMessage,
  RoomUpdateMessage,
  TokenRefreshedMessage,
} from "./types/messages";
export { WebSocketErrorHandler } from "./utils/error-handler";
export type {
  WebSocketErrorPayload,
  WebSocketServiceEvents,
} from "./websocket-service";
export {
  WebSocketService,
  webSocketService,
} from "./websocket-service";
