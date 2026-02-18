import { AutoLoading } from "@/src/shared/components/AutoLoading";

/**
 * Автоматический loading для страницы комнат
 */
export default function Loading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-6 w-24 bg-surface-200 rounded animate-pulse mb-4" />
          <div className="h-10 w-64 bg-surface-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-surface-200 rounded animate-pulse" />
        </div>
        <AutoLoading variant="grid" cols={3} />
      </div>
    </div>
  );
}

