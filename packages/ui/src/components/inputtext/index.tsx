"use client";

// Static import - webpack will resolve this from the app's node_modules
import { InputText as PrimeInputText } from "primereact/inputtext";
import type { ComponentProps } from "react";

export interface InputTextProps extends ComponentProps<typeof PrimeInputText> {}

export function InputText(props: InputTextProps) {
  return <PrimeInputText {...props} />;
}
