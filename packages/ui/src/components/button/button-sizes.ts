export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";

/** Label + icon buttons */
export const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 min-h-7 gap-1 px-2 text-xs [&_.p-button-icon]:text-xs",
  s: "h-8 min-h-8 gap-1.5 px-3 text-xs [&_.p-button-icon]:text-sm",
  m: "h-10 min-h-10 gap-2 px-4 text-sm [&_.p-button-icon]:text-base",
  l: "h-11 min-h-11 gap-2 px-6 text-base [&_.p-button-icon]:text-lg",
  xl: "h-12 min-h-12 gap-2.5 px-8 text-lg [&_.p-button-icon]:text-xl",
};

/** Icon-only buttons (no label / children) */
export const buttonIconOnlySizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 min-h-7 w-7 min-w-7 p-0 [&_.p-button-icon]:text-xs",
  s: "h-8 min-h-8 w-8 min-w-8 p-0 [&_.p-button-icon]:text-sm",
  m: "h-10 min-h-10 w-10 min-w-10 p-0 [&_.p-button-icon]:text-base",
  l: "h-12 min-h-12 w-12 min-w-12 p-0 [&_.p-button-icon]:text-lg",
  xl: "h-14 min-h-14 w-14 min-w-14 p-0 [&_.p-button-icon]:text-xl",
};

export function getButtonSizeClassName(
  size: ButtonSize | undefined,
  isIconOnly: boolean,
): string | undefined {
  if (!size) {
    return undefined;
  }
  return isIconOnly ? buttonIconOnlySizeClasses[size] : buttonSizeClasses[size];
}
