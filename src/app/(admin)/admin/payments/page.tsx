'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ projectId: '', amount: '', currency: 'INR', method: '', reference: '', notes: '', status: 'PAID' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await fetch('/api/admin/payments');
      return (await res.json()).data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await (await fetch('/api/admin/projects')).json()).data,
  });

  const createPayment = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
    },
    onSuccess: () => {
      setForm({ projectId: '', amount: '', currency: 'INR', method: '', reference: '', notes: '', status: 'PAID' });
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Record Manual Payment</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Project</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
            >
              <option value="">Select project</option>
              {projects?.items?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} maxLength={3} />
          <Input label="Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
          <Input label="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        </div>
        <div className="mt-3">
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
        </div>
        <div className="mt-3">
          <Button onClick={() => createPayment.mutate()} loading={createPayment.isPending} disabled={!form.projectId || !form.amount}>
            Record Payment
          </Button>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {data?.items?.length === 0 && <EmptyState title="No payments yet" />}
      {data?.items?.length > 0 && (
        <div className="glass overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface/50 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 hidden sm:table-cell">Project</th>
                <th className="px-4 py-3 hidden md:table-cell">Method</th>
                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p: any) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.amount), p.currency)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-text-secondary">{p.project?.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{p.method ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}