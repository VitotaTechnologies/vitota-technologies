export default function Loading() {
  return (
    <div className="space-y-6" role="status">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-32 animate-pulse rounded-lg border border-border bg-surface" />
        <div className="h-32 animate-pulse rounded-lg border border-border bg-surface" />
        <div className="h-32 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
      <span className="sr-only">Loading admin workspace</span>
    </div>
  );
}
