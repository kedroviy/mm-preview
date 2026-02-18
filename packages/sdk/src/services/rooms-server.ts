import { serverApi } from "../client-server";
import type { Room } from "./rooms";

export const roomsServerApi = {
  /**
   * Получить все комнаты текущего пользователя (серверный запрос)
   */
  getMyRooms: async (): Promise<Room[]> => {
    const response = await serverApi.get<Room[]>("/rooms/my");
    return response.data;
  },
};
