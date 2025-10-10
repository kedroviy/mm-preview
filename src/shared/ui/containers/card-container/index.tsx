"use client";

import { Card } from "primereact/card";
import { ReactNode } from "react";

type CustomCardContainer = {
  children: ReactNode;
};

export default function BasicContainer({ children }: CustomCardContainer) {
  return <Card className="mb-4 h-full p-1.5">{children}</Card>;
}
