"use client";

import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from "primereact/button";
import { forwardRef } from "react";

export interface ButtonProps extends PrimeButtonProps {
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <PrimeButton ref={ref} {...props}>
        {children}
      </PrimeButton>
    );
  }
);

Button.displayName = "Button";


