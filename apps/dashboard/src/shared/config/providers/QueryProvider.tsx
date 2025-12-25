"use client";

import { PropsWithChildren } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { defaultQueryClient } from "@mm-preview/sdk";

export default function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

