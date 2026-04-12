import type { ReactNode } from "react";

/** Сегмент маршрута `/guides` и вложенные `/guides/[slug]`. */
export const dynamic = "force-static";

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return children;
}
