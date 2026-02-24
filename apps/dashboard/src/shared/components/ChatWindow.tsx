"use client";

import type { ChatMessage } from "@mm-preview/sdk";
import { Button, Card, InputText } from "@mm-preview/ui";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  roomId: string;
  userId: string;
  userName: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isMuted?: boolean;
}

export function ChatWindow({
  roomId,
  userId,
  userName,
  messages,
  onSendMessage,
  isLoading = false,
  isMuted = false,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = () => {
    if (message.trim().length === 0) {
      return;
    }
    if (message.length > 1000) {
      alert("Сообщение слишком длинное (максимум 1000 символов)");
      return;
    }
    if (isMuted) {
      alert("Вы не можете отправлять сообщения (заглушены)");
      return;
    }
    onSendMessage(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="mt-6">
      <div className="flex flex-col h-[400px]">
        <div className="font-bold mb-2 pb-2 border-b border-surface-200 flex items-center justify-between">
          <span>Чат комнаты</span>
          {isMuted && (
            <span className="text-xs text-warning font-normal">
              ⚠️ Вы заглушены
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
          {messages.length === 0 ? (
            <p className="text-center text-muted-color py-8">
              Пока нет сообщений. Начните общение!
            </p>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.userId === userId;
              return (
                <div
                  key={`${msg.userId}-${msg.createdAt}-${index}`}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? "bg-primary text-primary-contrast"
                        : "bg-surface-100"
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {isOwnMessage ? "Вы" : msg.userName}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <InputText
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isMuted
                ? "Вы заглушены и не можете отправлять сообщения"
                : "Введите сообщение..."
            }
            disabled={isLoading || isMuted}
            maxLength={1000}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || isMuted || message.trim().length === 0}
          >
            Отправить
          </Button>
        </div>
        {message.length > 0 && (
          <div className="text-xs text-muted-color mt-1">
            {message.length}/1000 символов
          </div>
        )}
      </div>
    </Card>
  );
}
