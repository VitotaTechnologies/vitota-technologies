'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['client-project', id],
    queryFn: async () => (await (await fetch(`/api/client/projects/${id}`)).json()).data,
  });

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  const paid = data.payments.filter((p: any) => p.status === 'PAID').reduce((a: number, p: any) => a + Number(p.amount), 0);
  const pending = Math.max(0, Number(data.totalCost) - paid);
  const paymentProgress = Number(data.totalCost) > 0 ? Math.round((paid / Number(data.totalCost)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <StatusBadge status={data.status} />
        </div>
        {data.description && <p className="mt-3 text-sm text-text-secondary">{data.description}</p>}

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Overall Progress · Phase: {data.phase}</span><span>{data.progress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${data.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <ol className="mt-4 space-y-3">
          {data.milestones.length === 0 && <li className="text-sm text-text-muted">No milestones defined.</li>}
          {data.milestones.map((m: any) => (
            <li key={m.id} className="flex items-center gap-3">
              <span className={cn(
                'grid h-6 w-6 place-items-center rounded-full text-xs',
                m.status === 'COMPLETED' && 'bg-success text-white',
                m.status === 'IN_PROGRESS' && 'bg-primary text-primary-foreground',
                m.status === 'PENDING' && 'border border-border text-text-muted',
              )}>
                {m.status === 'COMPLETED' ? '✓' : m.status === 'IN_PROGRESS' ? '→' : '○'}
              </span>
              <div className="flex-1">
                <div className={cn('text-sm', m.status === 'COMPLETED' && 'text-text-secondary line-through')}>{m.name}</div>
              </div>
              <StatusBadge status={m.status} />
            </li>
          ))}
        </ol>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Payment Summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <div className="text-xs text-text-muted">Total Cost</div>
            <div className="mt-1 text-lg font-bold">{formatCurrency(Number(data.totalCost), data.currency)}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <div className="text-xs text-text-muted">Paid</div>
            <div className="mt-1 text-lg font-bold text-success">{formatCurrency(paid, data.currency)}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <div className="text-xs text-text-muted">Pending</div>
            <div className="mt-1 text-lg font-bold text-warning">{formatCurrency(pending, data.currency)}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Payment Progress</span><span>{paymentProgress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-gradient-to-r from-success to-primary" style={{ width: `${paymentProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Updates</h2>
        <div className="mt-4 space-y-3">
          {data.updates.length === 0 && <div className="text-sm text-text-muted">No updates yet.</div>}
          {data.updates.map((u: any) => (
            <div key={u.id} className="rounded-lg border border-border bg-surface/50 p-4">
              <div className="font-medium">{u.title}</div>
              <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">{u.description}</p>
              <div className="mt-2 text-xs text-text-muted">{formatDate(u.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}