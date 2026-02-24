"use client";

import type { CSSProperties, ReactNode } from "react";

export interface ColumnProps<T = any> {
  field?: string;
  header?: string | ReactNode;
  body?: (rowData: T, options?: any) => ReactNode;
  sortable?: boolean;
  sortField?: string;
  sortFunction?: (event: any) => void;
  filter?: boolean;
  filterMatchMode?: string;
  filterPlaceholder?: string;
  style?: CSSProperties;
  className?: string;
  headerStyle?: CSSProperties;
  headerClassName?: string;
  bodyStyle?: CSSProperties;
  bodyClassName?: string;
  footer?: string | ReactNode;
  footerStyle?: CSSProperties;
  footerClassName?: string;
  frozen?: boolean;
  align?: "left" | "center" | "right";
  alignHeader?: "left" | "center" | "right";
  alignFrozen?: "left" | "right";
  selectionMode?: "single" | "multiple";
  colSpan?: number;
  rowSpan?: number;
  exportable?: boolean;
  reorderable?: boolean;
  resizeable?: boolean;
  [key: string]: any;
}

// Column is a marker component for DataTable
// It doesn't render anything itself, DataTable extracts its props
export function Column<T = any>(_props: ColumnProps<T>) {
  return null;
}
