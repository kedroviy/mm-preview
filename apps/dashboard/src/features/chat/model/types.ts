import type { ChatMessage } from "@mm-preview/sdk";

export interface ChatWindowProps {
  userId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isMuted?: boolean;
}
