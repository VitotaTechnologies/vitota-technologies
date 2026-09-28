'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

export type CmsField =
  | { name: string; label: string; type: 'text' | 'textarea' | 'number' | 'url' | 'select'; options?: string[]; required?: boolean };

export function CmsList({
  title, endpoint, fields, displayPrimary, displaySecondary,
}: {
  title: string; endpoint: string; fields: CmsField[];
  displayPrimary: (item: any) => string;
  displaySecondary?: (item: any) => string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, any>>({ status: 'DRAFT', displayOrder: 0 });
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await (await fetch(endpoint)).json()).data,
  });

  const create = useMutation({
    mutationFn: async () => {
      setError(null);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'Failed');
      return json.data;
    },
    onSuccess: () => {
      setForm({ status: 'DRAFT', displayOrder: 0 });
      qc.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (e: any) => setError(e.message),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="glass rounded-xl p-6">
        <h2 className="text-sm font-semibold">Create</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((f) => {
            if (f.type === 'textarea') {
              return (
                <div key={f.name} className="sm:col-span-2">
                  <Textarea
                    label={f.label}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    rows={3}
                  />
                </div>
              );
            }
            if (f.type === 'select') {
              return (
                <div key={f.name}>
                  <label className="mb-1.5 block text-sm text-text-secondary">{f.label}</label>
                  <select
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                  >
                    <option value="">Select…</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );
            }
            return (
              <Input
                key={f.name}
                label={f.label}
                type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                value={form[f.name] ?? ''}
                onChange={(e) => setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                required={f.required}
              />
            );
          })}
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-4">
          <Button onClick={() => create.mutate()} loading={create.isPending}>Create</Button>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {data?.items?.length === 0 && <EmptyState title="Nothing here yet" />}
      {data?.items?.length > 0 && (
        <div className="space-y-2">
          {data.items.map((it: any) => (
            <div key={it.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
              <div>
                <div className="font-medium">{displayPrimary(it)}</div>
                {displaySecondary && <div className="text-xs text-text-muted">{displaySecondary(it)}</div>}
              </div>
              <StatusBadge status={it.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}