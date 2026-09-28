'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}>Mark all as read</Button>
      </div>

      {isLoading && <LoadingState />}
      {data?.items?.length === 0 && <EmptyState title="No notifications" />}
      {data?.items?.length > 0 && (
        <div className="space-y-2">
          {data.items.map((n: any) => (
            <div key={n.id} className={cn('glass rounded-lg p-4', !n.isRead && 'border-primary/40')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="mt-1 text-sm text-text-secondary">{n.message}</div>
                  <div className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</div>
                </div>
                {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}