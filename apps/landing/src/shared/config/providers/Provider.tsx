"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { PrimeReactProviderWrapper } from "@mm-preview/ui";
import QueryProvider from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => (
  <QueryProvider>
    <PrimeReactProviderWrapper>{children}</PrimeReactProviderWrapper>
  </QueryProvider>
);
