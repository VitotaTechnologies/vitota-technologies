export default function Loading() {
  return (
    <div className="space-y-6" role="status">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
      <span className="sr-only">Loading client workspace</span>
    </div>
  );
}
