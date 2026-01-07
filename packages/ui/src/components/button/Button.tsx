"use client";

import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from "primereact/button";
import { forwardRef } from "react";

export interface ButtonProps extends PrimeButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <PrimeButton ref={ref} className={className} {...props}>
        {children}
      </PrimeButton>
    );
  }
);

Button.displayName = "Button";


