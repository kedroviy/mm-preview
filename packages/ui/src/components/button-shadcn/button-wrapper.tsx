import * as React from "react";
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Badge } from "../badge-shadcn";
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "./button";

// ButtonProps for compatibility with existing API
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode;
  className?: string;
  outlined?: boolean;
  text?: boolean;
  rounded?: boolean;
  raised?: boolean;
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "help";
  icon?: string | ReactNode;
  iconPos?: "left" | "right" | "top" | "bottom";
  label?: string;
  loading?: boolean;
  loadingIcon?: string;
  badge?: string;
  badgeSeverity?: "success" | "info" | "warning" | "danger";
  tooltip?: string;
  tooltipOptions?: any;
  size?: "small" | "large";
  link?: boolean;
  [key: string]: any;
}

// Map severity to shadcn/ui variants
const severityToVariant = (
  severity?: ButtonProps["severity"],
  outlined?: boolean,
  text?: boolean,
  link?: boolean,
): ShadcnButtonProps["variant"] => {
  if (link) {
    return "link";
  }
  if (text) {
    return "ghost";
  }
  if (outlined) {
    return "outline";
  }
  if (severity === "danger") {
    return "destructive";
  }
  if (severity === "secondary") {
    return "secondary";
  }
  return "default";
};

// Map size to shadcn/ui size
const sizeToShadcnSize = (
  size?: "small" | "large",
): ShadcnButtonProps["size"] => {
  if (size === "small") {
    return "sm";
  }
  if (size === "large") {
    return "lg";
  }
  return "default";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon,
      className,
      badge,
      badgeSeverity,
      outlined,
      text,
      rounded,
      raised,
      severity,
      iconPos = "left",
      label,
      loading,
      size,
      link,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variant = severityToVariant(severity, outlined, text, link);
    const shadcnSize = sizeToShadcnSize(size);

    // Handle icon positioning with data-icon attribute for proper spacing
    const iconProps: Record<string, string | undefined> = {
      "data-icon":
        iconPos === "left"
          ? "inline-start"
          : iconPos === "right"
            ? "inline-end"
            : undefined,
    };
    const iconElement =
      typeof icon === "string" ? (
        <span className="icon">{icon}</span>
      ) : icon ? (
        React.isValidElement(icon) ? (
          React.cloneElement(icon as React.ReactElement, iconProps)
        ) : (
          icon
        )
      ) : null;

    const content = (
      <>
        {iconPos === "left" && iconElement}
        {label || children}
        {iconPos === "right" && iconElement}
        {badge && (
          <Badge
            value={badge}
            severity={badgeSeverity || "info"}
            className="ml-1"
          />
        )}
      </>
    );

    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={shadcnSize}
        disabled={disabled || loading}
        className={cn(
          rounded && "rounded-full",
          raised && "shadow-lg",
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              aria-hidden
              data-icon="inline-start"
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <title>Loading</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {content}
          </>
        ) : (
          content
        )}
      </ShadcnButton>
    );
  },
);

Button.displayName = "Button";
