export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">Loading Vitota Technologies</span>
    </div>
  );
}
