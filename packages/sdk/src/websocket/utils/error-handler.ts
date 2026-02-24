import type { WsError } from "../constants/errors";
import { WS_ERROR_CODES } from "../constants/errors";

/**
 * Обработка ошибок WebSocket по кодам бэкенда
 */
export class WebSocketErrorHandler {
  /**
   * Обрабатывает ошибку WebSocket и возвращает понятное сообщение
   */
  static handleError(error: WsError): string {
    switch (error.code) {
      case WS_ERROR_CODES.UNAUTHORIZED:
        return "Требуется авторизация. Пожалуйста, войдите в систему.";
      case WS_ERROR_CODES.FORBIDDEN:
        return error.message || "Доступ запрещен.";
      case WS_ERROR_CODES.BAD_REQUEST:
        return error.message || "Неверный запрос.";
      case WS_ERROR_CODES.NOT_FOUND:
        return error.message || "Ресурс не найден.";
      case WS_ERROR_CODES.RATE_LIMITED:
        return "Слишком много запросов. Пожалуйста, подождите.";
      case WS_ERROR_CODES.INTERNAL_ERROR:
        return "Внутренняя ошибка сервера. Попробуйте позже.";
      default:
        return error.message || "Произошла ошибка.";
    }
  }

  /**
   * Проверяет, является ли ошибка критической (требует переподключения / выхода)
   */
  static isCriticalError(error: WsError): boolean {
    return error.code === WS_ERROR_CODES.UNAUTHORIZED;
  }
}
