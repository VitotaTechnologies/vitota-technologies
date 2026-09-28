'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ClientProjectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => (await (await fetch('/api/client/projects')).json()).data,
  });
  if (isLoading) return <LoadingState />;
  if (!data?.items?.length) return <EmptyState title="No projects yet" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Projects</h1>
      {data.items.map((p: any) => (
        <Link key={p.id} href={`/client/projects/${p.id}`} className="glass flex items-center justify-between rounded-xl p-5">
          <div>
            <div className="font-semibold">{p.name}</div>
            <div className="mt-1 text-xs text-text-muted">Progress: {p.progress}%</div>
          </div>
          <StatusBadge status={p.status} />
        </Link>
      ))}
    </div>
  );
}