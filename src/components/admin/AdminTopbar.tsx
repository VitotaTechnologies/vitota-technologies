'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function AdminTopbar({ user }: { user: { name: string; role: string } }) {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/client/notifications');
      return res.json();
    },
    refetchInterval: 30_000,
  });
  const unread = data?.data?.unread ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background-secondary/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="pl-12 lg:pl-0" />
      <div className="flex items-center gap-3">
        <Link href="/admin/notifications" className="relative rounded-lg p-2 text-text-secondary hover:bg-surface" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>
        <div className="text-sm">
          <div className="font-medium text-text-primary">{user.name}</div>
          <div className="text-xs text-text-muted">{user.role}</div>
        </div>
      </div>
    </header>
  );
}