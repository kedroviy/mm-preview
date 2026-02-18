import type { Room } from "@mm-preview/sdk";

export interface JoinRoomFormProps {
  userId: string;
  onSuccess?: (result: Room) => void;
  onCancel?: () => void;
}

