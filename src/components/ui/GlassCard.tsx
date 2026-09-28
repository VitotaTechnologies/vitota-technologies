import { cn } from '@/lib/utils';

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('glass rounded-xl p-6', className)}>{children}</div>;
}