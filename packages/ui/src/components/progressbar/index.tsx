"use client";

// Static import - webpack will resolve this from the app's node_modules
import { ProgressSpinner as PrimeProgressSpinner } from "primereact/progressspinner";
import type { ComponentProps } from "react";

export interface ProgressSpinnerProps
  extends ComponentProps<typeof PrimeProgressSpinner> {}

export function ProgressSpinner(props: ProgressSpinnerProps) {
  return <PrimeProgressSpinner {...props} />;
}
