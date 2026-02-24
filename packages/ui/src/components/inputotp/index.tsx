"use client";

// Static import - webpack will resolve this from the app's node_modules
import { InputOtp as PrimeInputOtp } from "primereact/inputotp";
import type { ComponentProps } from "react";

export interface InputOtpProps extends ComponentProps<typeof PrimeInputOtp> {}

export function InputOtp(props: InputOtpProps) {
  return <PrimeInputOtp {...props} />;
}
