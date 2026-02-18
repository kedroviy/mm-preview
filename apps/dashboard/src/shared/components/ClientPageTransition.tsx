"use client";

import { Tooltip } from "@mm-preview/ui";
import { PageTransition } from "./PageTransition";

export function ClientPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Tooltip />
      <PageTransition>{children}</PageTransition>
    </>
  );
}

