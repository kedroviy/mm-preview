"use client";

import { Toast } from "@mm-preview/ui";
import type { PropsWithChildren, ReactNode } from "react";
import PrimeSSRProvider from "./PrimeReactProvider";
import QueryProvider from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => {
  return (
    <QueryProvider>
      <PrimeSSRProvider>
        <Toast />
        {children}
      </PrimeSSRProvider>
    </QueryProvider>
  );
};
