// Legacy components (will be deprecated)

// Export utils
export { cn } from "../lib/utils";
export { AppPreset } from "../presets/app-preset";
// Legacy provider (will be deprecated)
export { PrimeReactProviderWrapper } from "../providers/PrimeReactProvider";
// Export services and providers
export type { ToastMessage } from "../services/notification";
export { notificationService } from "../services/notification";
export * from "./badge";
// New shadcn/ui Badge component
export {
  Badge as BadgeShadcn,
  type BadgeProps as BadgePropsShadcn,
  badgeVariants,
} from "./badge-shadcn";
export * from "./button";
// New shadcn/ui based components
export {
  Button as ButtonShadcn,
  type ButtonProps as ButtonPropsShadcn,
  buttonVariants,
} from "./button-shadcn/button";
export {
  Button as ButtonShadcnWrapper,
  type ButtonProps,
} from "./button-shadcn/button-wrapper";
export * from "./card";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardProps,
  CardTitle,
} from "./card-shadcn";
export * from "./icon";
export * from "./inputotp";
export * from "./inputtext";
// New shadcn/ui Pagination component
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Paginator as PaginatorShadcn,
  type PaginatorProps as PaginatorPropsShadcn,
} from "./pagination-shadcn";
export * from "./paginator";
export * from "./progressbar";
export * from "./speeddial";
export * from "./table";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table-shadcn";
export {
  Column as ColumnShadcn,
  type ColumnProps as ColumnPropsShadcn,
  DataTable as DataTableShadcn,
  type DataTableProps as DataTablePropsShadcn,
} from "./table-shadcn/data-table";
export * from "./toast";
export * from "./tooltip";
