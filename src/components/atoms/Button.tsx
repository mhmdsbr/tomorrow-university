import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant =
  "primary" | "solid" | "subtle" | "filter" | "icon" | "media";
type ButtonSize = "small" | "medium" | "large";
type ButtonType = "button" | "submit" | "reset";

interface ButtonBaseProps {
  children: ReactNode;
  variant: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  ariaLabel?: string;
  className?: string;
}

type ButtonProps = ButtonBaseProps &
  (
    | {
        href: string;
        type?: never;
        disabled?: never;
        onClick?: never;
      }
    | {
        href?: never;
        type?: ButtonType;
        disabled?: boolean;
        onClick?: MouseEventHandler<HTMLButtonElement>;
      }
  );

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-45",
  primary:
    "w-5/12 cursor-pointer border rounded-md bg-primary px-4 py-2 text-left text-white transition hover:bg-primary-dark",
  subtle: "cursor-pointer text-sm hover:underline",
  filter:
    "cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300",
  icon: "flex cursor-pointer items-center justify-center rounded-full transition",
  media:
    "group relative mt-9 block w-full cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-gray-900 text-left shadow-2xl shadow-cyan-950/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 p-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "h-8 w-8 text-gray-400 hover:bg-gray-100 hover:text-gray-700",
  medium: "",
  large:
    "h-10 w-10 text-2xl text-gray-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300",
};

const filterStateClasses = {
  active: "bg-white text-black shadow-lg shadow-white/20 scale-105",
  inactive: "bg-gray-800 hover:bg-gray-700 hover:scale-105",
};

export default function Button({
  children,
  variant,
  size = "medium",
  type = "button",
  active = false,
  disabled = false,
  ariaLabel,
  onClick,
  href,
  className: additionalClassName,
}: ButtonProps) {
  const className = [
    variantClasses[variant],
    variant === "icon" ? sizeClasses[size] : "",
    variant === "filter"
      ? filterStateClasses[active ? "active" : "inactive"]
      : "",
    additionalClassName,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}
