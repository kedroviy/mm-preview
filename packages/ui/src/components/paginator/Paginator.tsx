"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { Paginator as PrimePaginator } from "primereact/paginator";

export interface PaginatorProps extends ComponentProps<typeof PrimePaginator> {}

export function Paginator(props: PaginatorProps) {
  return <PrimePaginator {...props} />;
}

