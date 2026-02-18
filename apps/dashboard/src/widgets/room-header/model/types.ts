import type { Room } from "@/src/entities/room";
import type { RoomRole } from "@mm-preview/sdk";

export interface RoomHeaderProps {
  room: Room;
  userRole?: RoomRole;
  onBack: () => void;
  onLeave: () => void;
  isLeaving: boolean;
  isPending: boolean;
}

