export function ErrorState({ title = 'Something went wrong', description = 'Please try again.', onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
      <h3 className="text-base font-semibold text-danger">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-lg bg-danger px-4 py-2 text-sm text-white">
          Retry
        </button>
      )}
    </div>
  );
}