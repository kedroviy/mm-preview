"use client";

import { Column } from "./Column";
import type {
  ReactNode,
} from "react";

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
  [key: string]: any; // Allow any other props from PrimeReact DataTable
}

export function DataTable<T = any>({
  data,
  value,
  columns,
  loading = false,
  emptyMessage = "Нет данных",
  children,
  ...props
}: DataTableProps<T>) {
  return (
    <PrimeDataTable
      value={(value || data) as any}
      loading={loading}
      emptyMessage={emptyMessage}
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
  );
}
