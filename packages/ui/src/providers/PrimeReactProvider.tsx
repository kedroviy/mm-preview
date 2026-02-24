"use client";
// In PrimeReact 10, PrimeReactProvider is imported from primereact/api
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
  // In PrimeReact 10 with tailwindcss-primeui, we need to pass the preset in the theme configuration
  // The value should contain the theme configuration with preset
  // Similar to Ant Design's ConfigProvider pattern
  return (
    <PrimeReactProvider
      value={
        {
          theme: {
            preset,
          },
          ripple: true,
        } as any
      }
    >
      {children}
    </PrimeReactProvider>
  );
}
