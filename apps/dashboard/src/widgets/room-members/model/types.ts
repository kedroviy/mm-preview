import type { Room } from "@/src/entities/room";
import type { RoomMember } from "@mm-preview/sdk";

export interface RoomMembersProps {
  room: Room;
  members: RoomMember[] | null | undefined;
  currentUserId: string;
  canManage: boolean;
  onRemoveMember?: (userId: string) => void;
}

