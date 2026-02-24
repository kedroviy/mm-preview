"use client";

// Static import - webpack will resolve this from the app's node_modules
import { Paginator as PrimePaginator } from "primereact/paginator";
import type { ComponentProps } from "react";

export interface PaginatorProps extends ComponentProps<typeof PrimePaginator> {}

export function Paginator(props: PaginatorProps) {
  return <PrimePaginator {...props} />;
}
