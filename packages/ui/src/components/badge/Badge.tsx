"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { Badge as PrimeBadge } from "primereact/badge";

export interface BadgeProps extends ComponentProps<typeof PrimeBadge> {}

export function Badge(props: BadgeProps) {
  return <PrimeBadge {...props} />;
}

