"use client";

import * as React from "react";
import { type ReactNode, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { Paginator } from "../pagination-shadcn";
import type { ColumnProps } from "./column";
import { Column } from "./column";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export interface DataTableProps<T = any> {
  value?: T[];
  data?: T[];
  columns?: Array<ColumnProps<T>>;
  loading?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  first?: number;
  onPage?: (event: {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
  }) => void;
  className?: string;
  [key: string]: any;
}

export type { ColumnProps } from "./column";
// Re-export Column for convenience
export { Column } from "./column";

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
  className,
  ...props
}: DataTableProps<T>) {
  const tableData = value || data || [];
  const [currentFirst, setCurrentFirst] = useState(first);
  const [currentRows, setCurrentRows] = useState(rows || 10);

  // Extract columns from children if provided
  const allColumns = useMemo(() => {
    if (columns) {
      return columns;
    }

    // If children are provided, extract Column components
    if (children) {
      const columnArray: ColumnProps<T>[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === Column) {
          columnArray.push(child.props as ColumnProps<T>);
        }
      });
      return columnArray;
    }

    return [];
  }, [columns, children]);

  const paginatedData = useMemo(() => {
    if (!paginator || !tableData || tableData.length === 0) {
      return tableData;
    }
    return tableData.slice(currentFirst, currentFirst + currentRows);
  }, [tableData, paginator, currentFirst, currentRows]);

  const handlePageChange = (event: {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
  }) => {
    setCurrentFirst(event.first);
    setCurrentRows(event.rows);
    onPage?.(event);
  };

  const totalRecords = tableData.length;
  const _pageCount = Math.ceil(totalRecords / currentRows);

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {allColumns.map((column, index) => (
                <TableHead key={column.field || index} style={column.style}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="text-center py-8"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    aria-hidden
                    className="h-4 w-4 animate-spin text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    Загрузка...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {allColumns.map((column, index) => (
                <TableHead key={column.field || index} style={column.style}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Table {...props}>
        <TableHeader>
          <TableRow>
            {allColumns.map((column, index) => (
              <TableHead
                key={column.field || index}
                style={column.style}
                className={column.className}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row: any, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {allColumns.map((column, colIndex) => {
                const cellValue = column.field ? row[column.field] : undefined;
                const cellContent = column.body
                  ? column.body(row, { rowIndex, colIndex })
                  : cellValue;

                return (
                  <TableCell
                    key={column.field || colIndex}
                    style={column.style}
                    className={column.className}
                  >
                    {cellContent}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {paginator && (
        <div className="mt-4">
          <Paginator
            first={currentFirst}
            rows={currentRows}
            totalRecords={totalRecords}
            rowsPerPageOptions={rowsPerPageOptions || [5, 10, 20]}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
