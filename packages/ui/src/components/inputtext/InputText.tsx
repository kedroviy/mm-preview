"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { InputText as PrimeInputText } from "primereact/inputtext";

export interface InputTextProps
  extends ComponentProps<typeof PrimeInputText> {}

export function InputText(props: InputTextProps) {
  return <PrimeInputText {...props} />;
}

