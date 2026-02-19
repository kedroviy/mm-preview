"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { SpeedDial as PrimeSpeedDial } from "primereact/speeddial";

export interface SpeedDialProps extends ComponentProps<typeof PrimeSpeedDial> {}

export function SpeedDial(props: SpeedDialProps) {
  return <PrimeSpeedDial {...props} />;
}

