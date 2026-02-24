"use client";

import { PrimeReactProviderWrapper } from "@mm-preview/ui";
import type { PropsWithChildren, ReactNode } from "react";
import QueryProvider from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => (
  <QueryProvider>
    <PrimeReactProviderWrapper>{children}</PrimeReactProviderWrapper>
  </QueryProvider>
);
