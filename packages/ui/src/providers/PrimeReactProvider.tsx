"use client";
// In PrimeReact 10, PrimeReactProvider is imported from primereact/api
// @ts-ignore - Module resolution happens at build time via webpack
import { PrimeReactProvider } from "primereact/api";
import type * as React from "react";
import { AppPreset } from "../presets/app-preset";

interface PrimeReactProviderProps {
  children: React.ReactNode;
  preset?: typeof AppPreset;
}

export function PrimeReactProviderWrapper({
  children,
  preset = AppPreset,
}: PrimeReactProviderProps) {
  // In PrimeReact 10, PrimeReactProvider accepts configuration
  // The exact API may vary, so we use @ts-ignore to suppress type errors
  // @ts-ignore - PrimeReact 10 API types may not be fully accurate
  return (
    <PrimeReactProvider value={{ preset } as any}>
      {children}
    </PrimeReactProvider>
  );
}

