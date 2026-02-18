"use client";

import { Toast, PrimeReactProviderWrapper } from "@mm-preview/ui";
import type { PropsWithChildren, ReactNode } from "react";
import QueryProvider from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export const Provider = ({ children }: PropsWithChildren<Props>) => {
  return (
    <QueryProvider>
      <PrimeReactProviderWrapper>
        <Toast />
        {children}
      </PrimeReactProviderWrapper>
    </QueryProvider>
  );
};
