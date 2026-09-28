import { cn } from '@/lib/utils';

export function EmptyState({
  title, description, icon, action, className,
}: {
  title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center', className)}>
      {icon && <div className="mb-3 text-text-muted">{icon}</div>}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}