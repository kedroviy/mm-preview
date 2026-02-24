"use client";

// Static import - webpack will resolve this from the app's node_modules
import { Tooltip as PrimeTooltip } from "primereact/tooltip";
import type { ComponentProps } from "react";

export interface TooltipProps extends ComponentProps<typeof PrimeTooltip> {}

export function Tooltip(props: TooltipProps) {
  return <PrimeTooltip {...props} />;
}
