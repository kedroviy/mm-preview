import type { RoomRole } from "@mm-preview/sdk";
import type { Room } from "@/src/entities/room";

export interface RoomHeaderProps {
  room: Room;
  userRole?: RoomRole;
  onBack: () => void;
  onLeave: () => void;
  isLeaving: boolean;
  isPending: boolean;
}
