"use client";

import { PropsWithChildren, ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import PrimeSSRProvider from "./PrimeReactProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => (
  <QueryProvider>
    <PrimeSSRProvider>{children}</PrimeSSRProvider>
  </QueryProvider>
);
