import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
} from "react";
import { Badge } from "../badge";

// Define ButtonProps manually to avoid TypeScript resolution issues
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
  icon?: string | ReactNode; // Support both string (PrimeIcons) and React elements
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
  [key: string]: any; // Allow any other props from PrimeReact Button
}

// Static import - webpack will resolve this from the app's node_modules
// TypeScript may show an error here, but webpack will resolve it correctly at build time
// @ts-ignore - Module resolution happens at build time via webpack
import { Button as PrimeButton } from "primereact/button";

export const Button = forwardRef<any, ButtonProps>(
  ({ children, icon, className, badge, badgeSeverity, ...props }, ref) => {
    // If icon is a React element (not a string), render it as children
    // Otherwise, pass it as icon prop to PrimeButton
    const isIconOnly = !children && !props.label && !!icon;
    
    // If icon is a React element, we need to render it as children
    const iconElement = typeof icon === "string" ? undefined : icon;
    const iconString = typeof icon === "string" ? icon : undefined;

    // If badge is provided, render Badge component as children
    // Use default severity "info" if badgeSeverity is not provided
    const badgeElement = badge ? (
      <Badge value={badge} severity={badgeSeverity || "info"} />
    ) : null;

    // Combine children: iconElement (if React element), badge, and original children
    const finalChildren = (
      <>
        {iconElement}
        {badgeElement}
        {children}
      </>
    );

    // If label is provided, PrimeReact handles label separately
    // But we still need to pass children for Badge
    const shouldRenderChildren = props.label 
      ? !!badgeElement  // If label exists, only render Badge as children
      : !!finalChildren; // Otherwise render all children

    return (
      <PrimeButton
        ref={ref}
        className={className}
        icon={iconString}
        aria-label={isIconOnly && !props["aria-label"] ? props.label || "Button" : props["aria-label"]}
        {...props}
      >
        {shouldRenderChildren ? (props.label ? badgeElement : finalChildren) : undefined}
      </PrimeButton>
    );
  },
);

Button.displayName = "Button";
