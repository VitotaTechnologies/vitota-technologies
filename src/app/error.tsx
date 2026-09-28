'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center space-bg">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Something went wrong</h1>
        <p className="mt-4 text-text-secondary">An unexpected error occurred.</p>
        <button onClick={reset} className="mt-6 rounded-lg bg-primary px-6 py-3 text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}