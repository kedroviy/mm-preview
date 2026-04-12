"use client";

import { PrimeReactProviderWrapper } from "@mm-preview/ui";
import type { PropsWithChildren } from "react";

/** Только UI-провайдер: на лендинге нет запросов к API через React Query. */
export const Provider = ({ children }: PropsWithChildren) => (
  <PrimeReactProviderWrapper>{children}</PrimeReactProviderWrapper>
);
