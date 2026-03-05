import type {
  Room,
  ChatMessage as RoomChatMessage,
} from "../../services/rooms";
import type { WsError } from "../constants/errors";

/**
 * Сообщение об ошибке от сервера
 */
export type ErrorMessage = WsError;

/**
 * Токен обновлён
 */
export interface TokenRefreshedMessage {
  accessToken: string;
  message?: string;
}

/**
 * Комната создана
 */
export interface RoomCreatedMessage {
  roomId: string;
  publicCode: string;
  room: Room;
}

/**
 * Присоединился к комнате
 */
export interface JoinedRoomMessage {
  roomId: string;
  publicCode: string;
  room: Room;
}

/**
 * Покинул комнату
 */
export interface LeftRoomMessage {
  roomId: string;
}

/**
 * Обновление комнаты
 */
export interface RoomUpdateMessage {
  roomId: string;
  room?: Room;
  event: "userJoined" | "userLeft" | "movieChosen" | "userConnected" | "userDisconnected";
  userId?: string;
  movieId?: string;
}

/**
 * Данные комнаты (ответ getRoom)
 */
export interface RoomDataMessage {
  roomId: string;
  room: Room;
}

/**
 * Мои комнаты
 */
export interface MyRoomsMessage {
  rooms: Room[];
}

/**
 * Сообщение чата (от сервера может содержать id)
 */
export interface ChatMessage extends RoomChatMessage {
  id?: string;
}

/**
 * История чата
 */
export interface ChatHistoryMessage {
  roomId: string;
  messages: ChatMessage[];
}

/**
 * Новое сообщение в чате
 */
export interface NewMessageMessage {
  roomId: string;
  message: ChatMessage;
}
