"use client";

import { PrimeReactProviderWrapper } from "@mm-preview/ui";
import type { PropsWithChildren, ReactNode } from "react";
import { WebSocketProvider } from "../../contexts/WebSocketContext";
import QueryProvider from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => (
  <QueryProvider>
    <PrimeReactProviderWrapper>
      <WebSocketProvider autoConnect={true}>{children}</WebSocketProvider>
    </PrimeReactProviderWrapper>
  </QueryProvider>
);
