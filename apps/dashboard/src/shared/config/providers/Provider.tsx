"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { PrimeReactProviderWrapper } from "@mm-preview/ui";
import QueryProvider from "./QueryProvider";
import { WebSocketProvider } from "../../contexts/WebSocketContext";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => (
  <QueryProvider>
    <PrimeReactProviderWrapper>
      <WebSocketProvider autoConnect={true}>
        {children}
      </WebSocketProvider>
    </PrimeReactProviderWrapper>
  </QueryProvider>
);
