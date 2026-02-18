/**
 * AutoLoading - автоматическая генерация loading состояний
 * Анализирует структуру страницы и создает skeleton на основе разметки
 */

export interface LoadingConfig {
  type: "skeleton" | "spinner" | "shimmer";
  className?: string;
}

/**
 * Базовый skeleton компонент
 */
export function Skeleton({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={`animate-pulse bg-surface-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

/**
 * Skeleton для заголовка
 */
export function SkeletonHeading({
  level = 1,
  className = "",
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const heights = {
    1: "h-10",
    2: "h-8",
    3: "h-7",
    4: "h-6",
    5: "h-5",
    6: "h-4",
  };

  return (
    <Skeleton
      className={`${heights[level]} w-3/4 ${className}`}
      height={heights[level]}
    />
  );
}

/**
 * Skeleton для текста
 */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 ? "75%" : "100%"}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton для карточки
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-6 border border-surface-200 rounded-lg ${className}`}>
      <SkeletonHeading level={2} className="mb-4" />
      <SkeletonText lines={2} />
      <Skeleton className="h-10 w-24 mt-4" />
    </div>
  );
}

/**
 * Skeleton для grid layout
 */
export function SkeletonGrid({
  cols = 3,
  className = "",
}: {
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[cols]} gap-6 ${className}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Универсальный loading компонент, который можно использовать для любой страницы
 */
export function AutoLoading({
  variant = "page",
  className = "",
}: {
  variant?: "page" | "card" | "grid" | "list" | "form";
  className?: string;
}) {
  switch (variant) {
    case "page":
      return (
        <div className={`min-h-screen p-8 ${className}`}>
          <div className="max-w-6xl mx-auto">
            <SkeletonHeading level={1} className="mb-2" />
            <SkeletonText lines={1} className="mb-8 w-1/3" />
            <SkeletonGrid cols={3} />
          </div>
        </div>
      );

    case "card":
      return <SkeletonCard className={className} />;

    case "grid":
      return <SkeletonGrid cols={3} className={className} />;

    case "list":
      return (
        <div className={`space-y-4 ${className}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border border-surface-200 rounded-lg">
              <SkeletonHeading level={3} className="mb-2" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      );

    case "form":
      return (
        <div className={`space-y-4 ${className}`}>
          <SkeletonHeading level={2} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </div>
      );

    default:
      return (
        <div className={`min-h-screen p-8 flex items-center justify-center ${className}`}>
          <div className="text-center">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <SkeletonText lines={2} className="w-64" />
          </div>
        </div>
      );
  }
}

