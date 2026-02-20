import type { Room } from "@/src/entities/room";

export interface RoomListProps {
  userId?: string;
  initialRooms?: Room[];
  onConnect: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
}
