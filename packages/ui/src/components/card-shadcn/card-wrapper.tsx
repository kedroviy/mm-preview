import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from "./card";

export interface CardProps {
  title?: string | ReactNode;
  subTitle?: string | ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  [key: string]: any;
}

export function Card({
  title,
  subTitle,
  children,
  className,
  style,
  header,
  footer,
  onClick,
  ...props
}: CardProps) {
  const hasHeader = title || subTitle || header;

  return (
    <ShadcnCard
      className={cn(onClick && "cursor-pointer", className)}
      style={style}
      onClick={onClick}
      {...props}
    >
      {hasHeader && (
        <CardHeader>
          {header || (
            <>
              {title && <CardTitle>{title}</CardTitle>}
              {subTitle && <CardDescription>{subTitle}</CardDescription>}
            </>
          )}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </ShadcnCard>
  );
}
