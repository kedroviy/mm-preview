// Static import - webpack will resolve this from the app's node_modules
import { Badge as PrimeBadge } from "primereact/badge";
import type { ComponentProps } from "react";

export interface BadgeProps extends ComponentProps<typeof PrimeBadge> {}

export function Badge(props: BadgeProps) {
  return <PrimeBadge {...props} />;
}
