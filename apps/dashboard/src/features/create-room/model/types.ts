import type { CreateRoomResponse } from "@mm-preview/sdk";

export interface CreateRoomFormProps {
  onSuccess?: (result: CreateRoomResponse) => void;
  onCancel?: () => void;
}
