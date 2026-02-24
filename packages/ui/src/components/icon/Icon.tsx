"use client";

export interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Icon({ name, className, style, size = "md" }: IconProps) {
  return (
    <i
      className={cn(`pi pi-${name}`, sizeClasses[size], className)}
      style={style}
    />
  );
}
