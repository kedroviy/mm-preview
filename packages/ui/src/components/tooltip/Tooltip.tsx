"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { Tooltip as PrimeTooltip } from "primereact/tooltip";

export interface TooltipProps extends ComponentProps<typeof PrimeTooltip> {}

export function Tooltip(props: TooltipProps) {
  return <PrimeTooltip {...props} />;
}

