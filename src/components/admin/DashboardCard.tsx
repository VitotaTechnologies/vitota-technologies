import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function DashboardCard({
  label, value, icon: Icon, tone = 'default',
}: {
  label: string; value: string | number; icon: LucideIcon; tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    default: 'text-text-secondary',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
          <div className="mt-2 text-2xl font-bold">{value}</div>
        </div>
        <div className={cn('rounded-lg bg-surface p-2', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}