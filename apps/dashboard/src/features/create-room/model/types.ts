import type { Room } from "@mm-preview/sdk";

export interface CreateRoomFormProps {
  /** Нужен для режима movieMatcher API (`NEXT_PUBLIC_USE_MOVIE_MATCH_API`). */
  userId?: string;
  onSuccess?: (result: Room) => void;
  onCancel?: () => void;
}
