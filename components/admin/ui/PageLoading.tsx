// Fallback shown while a page's request-time data streams in.
export default function PageLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <span className="border-primary-50 border-t-primary-500 size-10 animate-spin rounded-full border-4" />
    </div>
  );
}
