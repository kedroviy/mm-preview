import type { Room } from "@/src/entities/room";

export interface RoomListProps {
  rooms: Room[] | null | undefined;
  isLoading: boolean;
  onConnect: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
}

