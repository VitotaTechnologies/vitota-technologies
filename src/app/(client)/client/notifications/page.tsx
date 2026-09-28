'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ClientNotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['client-notifications-page'],
    queryFn: async () => (await (await fetch('/api/client/notifications')).json()).data,
  });

  const markAll = useMutation({
    mutationFn: async () => {
      await fetch('/api/client/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-notifications-page'] }),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}>Mark all as read</Button>
      </div>
      {data?.items?.length === 0 && <EmptyState title="No notifications" />}
      {data?.items?.map((n: any) => (
        <div key={n.id} className={cn('glass rounded-lg p-4', !n.isRead && 'border-primary/40')}>
          <div className="font-medium">{n.title}</div>
          <div className="mt-1 text-sm text-text-secondary">{n.message}</div>
          <div className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}