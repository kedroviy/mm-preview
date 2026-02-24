"use client";

import type { CSSProperties, ReactNode } from "react";

// In PrimeReact 10, Column is exported from the datatable module
// We define ColumnProps manually to avoid TypeScript resolution issues
export interface ColumnProps {
  field?: string;
  header?: string | ReactNode;
  body?: (rowData: any, options?: any) => ReactNode;
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
  [key: string]: any; // Allow any other props from PrimeReact Column
}

// Static import - webpack will resolve this from the app's node_modules
// In PrimeReact 10, Column is imported from primereact/column
import { Column as PrimeColumn } from "primereact/column";

export function Column(props: ColumnProps) {
  return <PrimeColumn {...props} />;
}
