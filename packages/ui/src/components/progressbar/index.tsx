"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { ProgressSpinner as PrimeProgressSpinner } from "primereact/progressspinner";

export interface ProgressSpinnerProps
  extends ComponentProps<typeof PrimeProgressSpinner> {}

export function ProgressSpinner(props: ProgressSpinnerProps) {
  return <PrimeProgressSpinner {...props} />;
}
