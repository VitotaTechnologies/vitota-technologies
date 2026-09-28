'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function LeadsPage() {
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-leads', filter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leads?filter=${filter === 'urgent' ? 'urgent' : ''}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setFilter('all')}
            className={cn('rounded-md px-3 py-1.5 text-sm', filter === 'all' && 'bg-primary text-primary-foreground')}
          >
            All Leads
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={cn('rounded-md px-3 py-1.5 text-sm', filter === 'urgent' && 'bg-success text-white')}
          >
            Urgent Only
          </button>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState onRetry={() => refetch()} />}
      {data && data.items.length === 0 && <EmptyState title="No leads found" description="Leads submitted through the contact form will appear here." />}

      {data && data.items.length > 0 && (
        <div className="glass overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface/50 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden sm:table-cell">Service</th>
                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((l: any) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs',
                      l.urgent
                        ? 'border-success/40 bg-success/10 text-success'
                        : 'border-primary/30 bg-primary/10 text-primary'
                    )}>
                      <span aria-hidden>{l.urgent ? '✓' : '•'}</span>
                      {l.urgent ? 'Urgent' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-text-muted">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-text-secondary">{l.service ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{formatDateTime(l.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/leads/${l.id}`} className="text-primary hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}