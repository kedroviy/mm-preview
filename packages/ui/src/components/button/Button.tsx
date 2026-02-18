"use client";

import {
  type ButtonHTMLAttributes,
  forwardRef,
} from "react";

// Define ButtonProps manually to avoid TypeScript resolution issues
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
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
  icon?: string;
  iconPos?: "left" | "right" | "top" | "bottom";
  label?: string;
  loading?: boolean;
  loadingIcon?: string;
  badge?: string;
  badgeClassName?: string;
  tooltip?: string;
  tooltipOptions?: any;
  [key: string]: any; // Allow any other props from PrimeReact Button
}

// Static import - webpack will resolve this from the app's node_modules
// TypeScript may show an error here, but webpack will resolve it correctly at build time
// @ts-ignore - Module resolution happens at build time via webpack
import { Button as PrimeButton } from "primereact/button";

export const Button = forwardRef<any, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <PrimeButton ref={ref} className={className} {...props}>
        {children}
      </PrimeButton>
    );
  },
);

Button.displayName = "Button";
