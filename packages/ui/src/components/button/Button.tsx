"use client";

import { Button as PrimeButton } from "primereact/button";
import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  forwardRef,
} from "react";

export interface ButtonProps
  extends Omit<ComponentProps<typeof PrimeButton>, "children">,
    ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  outlined?: boolean;
  text?: boolean;
  rounded?: boolean;
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <PrimeButton ref={ref} className={className} {...props}>
        {children}
      </PrimeButton>
    );
  },
);

Button.displayName = "Button";
