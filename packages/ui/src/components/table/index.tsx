"use client";

import { Column } from "./Column";
import { Paginator } from "../paginator";
import { useState, useMemo } from "react";
import type {
  ReactNode,
} from "react";

// Re-export Column for convenience
export { Column } from "./Column";
export type { ColumnProps } from "./Column";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { DataTable as PrimeDataTable } from "primereact/datatable";

export interface DataTableProps<T = any> {
  value?: T[];
  data?: T[]; // Alias for value for backward compatibility
  columns?: Array<{
    field: string;
    header: string;
    body?: (rowData: T) => ReactNode;
    sortable?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }>;
  loading?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  first?: number;
  onPage?: (event: { first: number; rows: number; page: number; pageCount: number }) => void;
  [key: string]: any; // Allow any other props from PrimeReact DataTable
}

export function DataTable<T = any>({
  data,
  value,
  columns,
  loading = false,
  emptyMessage = "Нет данных",
  paginator = false,
  rows,
  rowsPerPageOptions,
  first = 0,
  onPage,
  children,
  ...props
}: DataTableProps<T>) {
  const tableData = (value || data) as any;
  const [currentFirst, setCurrentFirst] = useState(first);
  const [currentRows, setCurrentRows] = useState(rows || 10);

  const paginatedData = useMemo(() => {
    if (!paginator || !tableData) return tableData;
    return tableData.slice(currentFirst, currentFirst + currentRows);
  }, [tableData, paginator, currentFirst, currentRows]);

  const handlePageChange = (event: { first: number; rows: number; page: number; pageCount: number }) => {
    setCurrentFirst(event.first);
    setCurrentRows(event.rows);
    onPage?.(event);
  };

  return (
    <div className="p-datatable-wrapper">
      <PrimeDataTable
        value={paginatedData}
        loading={loading}
        emptyMessage={emptyMessage}
        paginator={false}
        {...props}
      >
        {columns?.map((column) => (
          <Column
            key={column.field}
            field={column.field}
            header={column.header}
            body={column.body}
            sortable={column.sortable !== false}
            style={column.style}
            className={column.className}
          />
        ))}
        {children}
      </PrimeDataTable>
      {paginator && (
        <>
          <Paginator
            first={currentFirst}
            rows={currentRows}
            totalRecords={tableData?.length || 0}
            rowsPerPageOptions={rowsPerPageOptions || [5, 10, 20]}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

