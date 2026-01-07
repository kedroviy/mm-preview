export type ToastMessage = {
  severity: "success" | "error" | "info" | "warn";
  summary: string;
  detail: string;
  life: number;
};

type ToastListener = (message: ToastMessage) => void;

class NotificationService {
  private listeners: Set<ToastListener> = new Set();
  private pendingMessages: ToastMessage[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);

    // Отправляем накопленные сообщения новому подписчику
    if (this.pendingMessages.length > 0) {
      const messages = [...this.pendingMessages];
      this.pendingMessages = [];
      Promise.resolve().then(() => {
        for (const msg of messages) {
          listener(msg);
        }
      });
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(message: ToastMessage) {
    if (this.listeners.size > 0) {
      this.listeners.forEach((listener) => {
        listener(message);
      });
    } else {
      // Если нет подписчиков, сохраняем сообщение
      this.pendingMessages.push(message);
      // Ограничиваем размер очереди
      if (this.pendingMessages.length > 10) {
        this.pendingMessages.shift();
      }
    }
  }

  showSuccess(message: string, summary = "Success") {
    this.notify({
      severity: "success",
      summary,
      detail: message,
      life: 3000,
    });
  }

  showError(message: string, summary = "Error") {
    this.notify({
      severity: "error",
      summary,
      detail: message,
      life: 5000,
    });
  }

  showInfo(message: string, summary = "Info") {
    this.notify({
      severity: "info",
      summary,
      detail: message,
      life: 3000,
    });
  }

  showWarn(message: string, summary = "Warning") {
    this.notify({
      severity: "warn",
      summary,
      detail: message,
      life: 4000,
    });
  }
}

export const notificationService = new NotificationService();
