type SpinnerSize = "sm" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  lg: "h-12 w-12 border-t-2 border-b-2",
};

export default function LoadingSpinner({
  size = "lg",
  label = "Loading content",
  className = size === "lg" ? "border-white" : "",
}: LoadingSpinnerProps) {
  const spinner = [
    sizeClasses[size],
    "shrink-0 animate-spin rounded-full",
    size === "sm" ? "border-current border-t-transparent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Small spinners sit next to visible text, so they are decorative.
  return size === "sm" ? (
    <span aria-hidden="true" className={spinner} />
  ) : (
    <div className={spinner} role="status" aria-label={label} />
  );
}
