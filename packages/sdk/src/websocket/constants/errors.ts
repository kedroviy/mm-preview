/**
 * Коды ошибок WebSocket (соответствуют бэкенду WsErrors)
 */
export const WS_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type WsErrorCode = (typeof WS_ERROR_CODES)[keyof typeof WS_ERROR_CODES];

/**
 * Интерфейс ошибки WebSocket от сервера
 */
export interface WsError {
  message: string;
  code: WsErrorCode;
  event?: string;
}
