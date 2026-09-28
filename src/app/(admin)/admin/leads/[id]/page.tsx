'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { formatDateTime } from '@/lib/utils';

const statuses = ['NEW', 'CONTACTED', 'DISCUSSION', 'PROPOSAL', 'CONVERTED', 'CLOSED'];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const router = useRouter();
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leads/${id}`);
      const json = await res.json();
      return json.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead', id] }),
  });

  const addNote = useMutation({
    mutationFn: async (content: string) => {
      await fetch(`/api/admin/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      setNote('');
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  const convert = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/leads/${id}/convert`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] });
      alert('Lead converted to client.');
    },
    onError: (e: any) => alert(e.message),
  });

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-sm text-text-secondary hover:text-text-primary">← Back</button>

      <div className="glass rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <div className="mt-1 text-sm text-text-secondary">{data.email} · {data.phone}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={data.urgent ? 'rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs text-success' : 'rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary'}>
              {data.urgent ? '✓ Urgent' : '• Normal'}
            </span>
            <StatusBadge status={data.status} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div><dt className="text-text-muted">Service</dt><dd>{data.service ?? '—'}</dd></div>
          <div><dt className="text-text-muted">Date</dt><dd>{formatDateTime(data.createdAt)}</dd></div>
          <div><dt className="text-text-muted">Converted</dt><dd>{data.convertedAt ? formatDateTime(data.convertedAt) : '—'}</dd></div>
        </dl>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-text-secondary">Message</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{data.message}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <Button key={s} size="sm" variant={data.status === s ? 'primary' : 'secondary'} onClick={() => updateStatus.mutate(s)}>
              {s.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {!data.convertedToClientId && (
          <div className="mt-6">
            <Button variant="success" onClick={() => convert.mutate()} loading={convert.isPending}>
              Convert to Client
            </Button>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Internal Notes</h2>
        <div className="mt-4 space-y-3">
          {data.notes?.length === 0 && <div className="text-sm text-text-muted">No internal notes yet.</div>}
          {data.notes?.map((n: any) => (
            <div key={n.id} className="rounded-lg border border-border bg-surface/50 p-3">
              <p className="text-sm">{n.content}</p>
              <div className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note..." rows={3} />
          <div className="mt-2">
            <Button onClick={() => note.trim() && addNote.mutate(note)} loading={addNote.isPending}>
              Add Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}