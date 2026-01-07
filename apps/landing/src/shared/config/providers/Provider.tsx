"use client";

import type { PropsWithChildren, ReactNode } from "react";
import PrimeSSRProvider from "./PrimeReactProvider";
import QueryProvider from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => (
  <QueryProvider>
    <PrimeSSRProvider>{children}</PrimeSSRProvider>
  </QueryProvider>
);
