"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { AnimateOnScroll as PrimeAnimateOnScroll } from "primereact/animateonscroll";

export interface AnimateOnScrollProps extends ComponentProps<typeof PrimeAnimateOnScroll> {}

export function AnimateOnScroll(props: AnimateOnScrollProps) {
  return <PrimeAnimateOnScroll {...props} />;
}

