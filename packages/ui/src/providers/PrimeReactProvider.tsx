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
  // In PrimeReact 10 with tailwindcss-primeui, we need to pass the preset correctly
  // The value should contain the preset configuration
  return (
    <PrimeReactProvider value={{ preset, ripple: true } as any}>
      {children}
    </PrimeReactProvider>
  );
}

