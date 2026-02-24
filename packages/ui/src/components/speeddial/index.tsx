"use client";

// Static import - webpack will resolve this from the app's node_modules
import { SpeedDial as PrimeSpeedDial } from "primereact/speeddial";
import type { ComponentProps } from "react";

export interface SpeedDialProps extends ComponentProps<typeof PrimeSpeedDial> {}

export function SpeedDial(props: SpeedDialProps) {
  return <PrimeSpeedDial {...props} />;
}
