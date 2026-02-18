import type { Room } from "@/src/entities/room";

export interface RoomListProps {
  initialRooms?: Room[];
  onConnect: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
}
