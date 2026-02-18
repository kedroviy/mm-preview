"use client";

import { Button, Card } from "@mm-preview/ui";
import type { RoomNotMemberProps } from "../model/types";

export function RoomNotMember({ onBack, isPending }: RoomNotMemberProps) {
  return (
    <Card className="mt-6">
      <p className="text-center text-muted-color mb-4">
        Вы не являетесь участником этой комнаты
      </p>
      <Button
        onClick={onBack}
        className="w-full"
        disabled={isPending}
      >
        Вернуться к комнатам
      </Button>
    </Card>
  );
}

