'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/utils';

export default function ClientDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => (await (await fetch('/api/client/projects')).json()).data,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back</h1>

      {data?.items?.length === 0 && (
        <EmptyState title="No projects yet" description="Your projects will appear here once created." />
      )}

      {data?.items?.map((p: any) => {
        const paid = p.payments.filter((x: any) => x.status === 'PAID').reduce((a: number, x: any) => a + Number(x.amount), 0);
        const pending = Math.max(0, Number(p.totalCost) - paid);
        return (
          <Link key={p.id} href={`/client/projects/${p.id}`} className="glass block rounded-xl p-6 hover:border-primary/40">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Progress</span><span>{p.progress}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-text-muted">Total</div>
                <div className="text-sm font-medium">{formatCurrency(Number(p.totalCost), p.currency)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Paid</div>
                <div className="text-sm font-medium text-success">{formatCurrency(paid, p.currency)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Pending</div>
                <div className="text-sm font-medium text-warning">{formatCurrency(pending, p.currency)}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}