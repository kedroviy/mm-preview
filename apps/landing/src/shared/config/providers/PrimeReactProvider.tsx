"use client";
import { PrimeReactProvider, PrimeReactStyleSheet } from "@primereact/core";
import { useServerInsertedHTML } from "next/navigation";
import type * as React from "react";
import { AppPreset } from "../presets/app-preset";

const styledStyleSheet = new PrimeReactStyleSheet();

export default function PrimeSSRProvider({
  children,
}: Readonly<{
  children?: React.ReactNode;
}>) {
  useServerInsertedHTML(() => {
    const styleElements = styledStyleSheet.getAllElements();

    styledStyleSheet.clear();

    return <>{styleElements}</>;
  });

  const primereact = {
    theme: {
      preset: AppPreset,
    },
  };

  return (
    <PrimeReactProvider {...primereact} stylesheet={styledStyleSheet}>
      {children}
    </PrimeReactProvider>
  );
}
