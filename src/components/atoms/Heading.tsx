import type { ReactNode, Ref } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingSize =
  | "inherit"
  | "lg"
  | "xl"
  | "2xl"
  | "4xl"
  | "service"
  | "section"
  | "sectionCompact"
  | "sectionLarge"
  | "intro";
type HeadingColor = "inherit" | "white" | "gray-900" | "pink-gradient";
type HeadingWeight = "inherit" | "semibold" | "bold" | "extrabold";
type HeadingFont = "inherit" | "mono" | "roboto";
type HeadingAlign = "inherit" | "left" | "center";
type HeadingSpacing =
  | "none"
  | "topSmall"
  | "bottomSmall"
  | "bottomMedium"
  | "bottomLarge";

interface HeadingProps {
  as: HeadingTag;
  size: HeadingSize;
  color: HeadingColor;
  children: ReactNode;
  weight?: HeadingWeight;
  font?: HeadingFont;
  align?: HeadingAlign;
  spacing?: HeadingSpacing;
  id?: string;
  ref?: Ref<HTMLHeadingElement>;
}

const sizeClasses: Record<HeadingSize, string> = {
  inherit: "",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "4xl": "text-4xl",
  service: "text-lg md:text-2xl",
  section: "text-4xl sm:text-5xl lg:text-6xl",
  sectionCompact: "text-4xl md:text-6xl",
  sectionLarge: "text-5xl md:text-7xl",
  intro: "text-xl sm:text-2xl md:text-4xl",
};

const colorClasses: Record<HeadingColor, string> = {
  inherit: "",
  white: "text-white",
  "gray-900": "text-gray-900",
  "pink-gradient": "pink-gradient-text",
};

const weightClasses: Record<HeadingWeight, string> = {
  inherit: "",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const fontClasses: Record<HeadingFont, string> = {
  inherit: "",
  mono: "font-mono",
  roboto: "font-roboto",
};

const alignClasses: Record<HeadingAlign, string> = {
  inherit: "",
  left: "text-left",
  center: "text-center",
};

const spacingClasses: Record<HeadingSpacing, string> = {
  none: "",
  topSmall: "mt-2",
  bottomSmall: "mb-2",
  bottomMedium: "mb-4",
  bottomLarge: "mb-12",
};

export default function Heading({
  as,
  size,
  color,
  children,
  weight = "bold",
  font = "inherit",
  align = "inherit",
  spacing = "none",
  id,
  ref,
}: HeadingProps) {
  const Tag = as;
  const className = [
    sizeClasses[size],
    colorClasses[color],
    weightClasses[weight],
    fontClasses[font],
    alignClasses[align],
    spacingClasses[spacing],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag id={id} ref={ref} className={className}>
      {children}
    </Tag>
  );
}
