import type { JoinRoomResponse } from "@mm-preview/sdk";

export interface JoinRoomFormProps {
  userId: string;
  onSuccess?: (result: JoinRoomResponse) => void;
  onCancel?: () => void;
}

