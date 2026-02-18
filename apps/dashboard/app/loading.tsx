import { AutoLoading } from "@/src/shared/components/AutoLoading";

/**
 * Автоматический loading для главной страницы
 * Генерирует skeleton на основе структуры страницы
 */
export default function Loading() {
  return <AutoLoading variant="page" />;
}
