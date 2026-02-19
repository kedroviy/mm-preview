"use client";

import type { ComponentProps } from "react";

// Static import - webpack will resolve this from the app's node_modules
// @ts-ignore - Module resolution happens at build time via webpack
import { InputOtp as PrimeInputOtp } from "primereact/inputotp";

export interface InputOtpProps extends ComponentProps<typeof PrimeInputOtp> {}

export function InputOtp(props: InputOtpProps) {
  return <PrimeInputOtp {...props} />;
}

