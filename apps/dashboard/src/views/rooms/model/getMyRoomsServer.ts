import type { Room } from "@/src/entities/room";

/**
 * Серверная функция для получения комнат пользователя
 * Комнаты получаются только через WebSocket, поэтому на сервере возвращаем пустой массив
 * Реальные данные будут загружены на клиенте через WebSocket
 */
export async function getMyRoomsServer(): Promise<Room[]> {
  // Комнаты получаются только через WebSocket, поэтому на сервере возвращаем пустой массив
  // Реальные данные будут загружены на клиенте через useWebSocketMyRooms
  return [];
}
