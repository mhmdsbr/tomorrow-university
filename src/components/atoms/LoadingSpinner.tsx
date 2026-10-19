export default function LoadingSpinner() {
  return (
    <div
      className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-white"
      role="status"
      aria-label="Loading content"
    />
  );
}
