/**
 * Утилита для автоматической генерации loading состояний
 * на основе структуры страницы
 */

import type { ReactNode } from "react";
import { AutoLoading } from "../components/AutoLoading";

export interface PageStructure {
  hasHeader?: boolean;
  hasGrid?: boolean;
  gridCols?: 1 | 2 | 3 | 4;
  hasCards?: boolean;
  cardCount?: number;
  hasForm?: boolean;
  hasList?: boolean;
  listItems?: number;
}

/**
 * Генерирует loading компонент на основе структуры страницы
 */
export function generateLoadingFromStructure(
  structure: PageStructure,
): ReactNode {
  const {
    hasHeader = true,
    hasGrid = false,
    gridCols = 3,
    hasCards = false,
    cardCount = 3,
    hasForm = false,
    hasList = false,
    listItems: _listItems = 5,
  } = structure;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {hasHeader && (
          <div className="mb-8">
            <div className="h-10 w-64 bg-surface-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-surface-200 rounded animate-pulse" />
          </div>
        )}

        {hasGrid && <AutoLoading variant="grid" cols={gridCols} />}

        {hasCards && !hasGrid && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: cardCount }).map((_, i) => (
              <AutoLoading key={i} variant="card" />
            ))}
          </div>
        )}

        {hasForm && <AutoLoading variant="form" />}

        {hasList && <AutoLoading variant="list" />}
      </div>
    </div>
  );
}

/**
 * Предустановленные конфигурации для разных типов страниц
 */
export const LoadingPresets = {
  dashboard: (): ReactNode =>
    generateLoadingFromStructure({
      hasHeader: true,
      hasGrid: true,
      gridCols: 3,
    }),

  roomsList: (): ReactNode =>
    generateLoadingFromStructure({
      hasHeader: true,
      hasGrid: true,
      gridCols: 3,
    }),

  roomDetail: (): ReactNode =>
    generateLoadingFromStructure({
      hasHeader: true,
      hasGrid: true,
      gridCols: 2,
      hasCards: true,
      cardCount: 1,
    }),

  form: (): ReactNode =>
    generateLoadingFromStructure({
      hasHeader: true,
      hasForm: true,
    }),

  list: (): ReactNode =>
    generateLoadingFromStructure({
      hasHeader: true,
      hasList: true,
    }),
};
