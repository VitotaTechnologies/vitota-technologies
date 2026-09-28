'use client';

import { useQuery } from '@tanstack/react-query';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ClientPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-payments'],
    queryFn: async () => (await (await fetch('/api/client/payments')).json()).data,
  });
  if (isLoading) return <LoadingState />;
  if (!data?.items?.length) return <EmptyState title="No payment history" description="Payments recorded against your projects will appear here." />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="glass overflow-hidden rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface/50 text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 hidden sm:table-cell">Project</th>
              <th className="px-4 py-3 hidden md:table-cell">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p: any) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.amount), p.currency)}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-text-secondary">{p.project?.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}