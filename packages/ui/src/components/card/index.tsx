import type { CSSProperties, ReactNode } from "react";

// Define CardProps manually to avoid TypeScript resolution issues
export interface CardProps {
  title?: string | ReactNode;
  subTitle?: string | ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  [key: string]: any; // Allow any other props from PrimeReact Card
}

// Static import - webpack will resolve this from the app's node_modules
// TypeScript may show an error here, but webpack will resolve it correctly at build time
import { Card as PrimeCard } from "primereact/card";

export function Card(props: CardProps) {
  return <PrimeCard {...props} />;
}
