import type { ReactNode } from "react";

type TypographySize = "inherit" | "xs" | "sm" | "base" | "lg";
type TypographyColor =
  | "inherit"
  | "white"
  | "muted"
  | "body"
  | "subtle"
  | "accent";
type TypographyWeight = "inherit" | "normal" | "medium" | "semibold";
type TypographyAlign = "inherit" | "left" | "center" | "footer";
type TypographyTransform = "none" | "uppercase";
type TypographyTracking = "normal" | "wide" | "widest";
type TypographyLeading = "inherit" | "normal" | "relaxed" | "7" | "8";
type TypographySpacing =
  | "none"
  | "topSmall"
  | "topMedium"
  | "topLarge"
  | "bottomSmall"
  | "bottomMedium"
  | "bottomLarge";
type TypographyWidth = "inherit" | "medium";
type TypographyOverflow = "none" | "truncate" | "clamp2";

interface TypographyProps {
  children: ReactNode;
  size: TypographySize;
  color: TypographyColor;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  transform?: TypographyTransform;
  tracking?: TypographyTracking;
  leading?: TypographyLeading;
  spacing?: TypographySpacing;
  width?: TypographyWidth;
  overflow?: TypographyOverflow;
}

const sizeClasses: Record<TypographySize, string> = {
  inherit: "",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const colorClasses: Record<TypographyColor, string> = {
  inherit: "",
  white: "text-white",
  muted: "text-brand-400",
  body: "text-brand-200",
  subtle: "text-brand-800",
  accent: "text-brand-300",
};

const weightClasses: Record<TypographyWeight, string> = {
  inherit: "",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

const alignClasses: Record<TypographyAlign, string> = {
  inherit: "",
  left: "text-left",
  center: "text-center",
  footer: "text-center md:text-left",
};

const transformClasses: Record<TypographyTransform, string> = {
  none: "",
  uppercase: "uppercase",
};

const trackingClasses: Record<TypographyTracking, string> = {
  normal: "",
  wide: "tracking-wider",
  widest: "tracking-[0.25em]",
};

const leadingClasses: Record<TypographyLeading, string> = {
  inherit: "",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  "7": "leading-7",
  "8": "leading-8",
};

const spacingClasses: Record<TypographySpacing, string> = {
  none: "",
  topSmall: "mt-3",
  topMedium: "mt-4",
  topLarge: "mt-8",
  bottomSmall: "mb-2",
  bottomMedium: "mb-3",
  bottomLarge: "mb-4",
};

const widthClasses: Record<TypographyWidth, string> = {
  inherit: "",
  medium: "max-w-2xl",
};

const overflowClasses: Record<TypographyOverflow, string> = {
  none: "",
  truncate: "truncate",
  clamp2: "line-clamp-2",
};

export default function Typography({
  children,
  size,
  color,
  weight = "inherit",
  align = "inherit",
  transform = "none",
  tracking = "normal",
  leading = "inherit",
  spacing = "none",
  width = "inherit",
  overflow = "none",
}: TypographyProps) {
  const className = [
    sizeClasses[size],
    colorClasses[color],
    weightClasses[weight],
    alignClasses[align],
    transformClasses[transform],
    trackingClasses[tracking],
    leadingClasses[leading],
    spacingClasses[spacing],
    widthClasses[width],
    overflowClasses[overflow],
  ]
    .filter(Boolean)
    .join(" ");

  return <p className={className}>{children}</p>;
}
