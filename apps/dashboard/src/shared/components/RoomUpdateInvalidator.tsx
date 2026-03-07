"use client";

import type { PropsWithChildren } from "react";
import { useInvalidateRoomOnUpdate } from "../hooks/useInvalidateRoomOnUpdate";

/**
 * При получении roomUpdate по WebSocket инвалидирует запросы комнаты и участников,
 * чтобы страница комнаты и список участников обновлялись у всех в комнате.
 */
export function RoomUpdateInvalidator({ children }: PropsWithChildren) {
  useInvalidateRoomOnUpdate();
  return <>{children}</>;
}
