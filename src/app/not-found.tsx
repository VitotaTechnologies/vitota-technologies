import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center space-bg">
      <div className="text-center">
        <h1 className="text-7xl font-bold glow-text">404</h1>
        <p className="mt-4 text-text-secondary">The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground">Return Home</Link>
      </div>
    </div>
  );
}