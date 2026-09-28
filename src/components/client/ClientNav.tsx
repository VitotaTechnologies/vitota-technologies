'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  CreditCard,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const items = [
  {
    href: '/client',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/client/projects',
    label: 'Projects',
    icon: FolderKanban,
  },
  {
    href: '/client/messages',
    label: 'Messages',
    icon: MessageSquare,
  },
  {
    href: '/client/payments',
    label: 'Payments',
    icon: CreditCard,
  },
  {
    href: '/client/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    href: '/client/profile',
    label: 'Profile',
    icon: UserCircle,
  },
  {
    href: '/client/settings',
    label: 'Settings',
    icon: Settings,
  },
];

type ClientUser = {
  name: string;
  email?: string;
  image?: string | null;
  profileImage?: string | null;
};

export function ClientNav({
  user,
}: {
  user: ClientUser;
}) {
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: ['client-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/client/notifications');

      if (!res.ok) {
        throw new Error('Failed to load notifications.');
      }

      const json = await res.json();

      return json.data;
    },
    refetchInterval: 30_000,
  });

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      window.location.href = '/login';
    }
  }

  const clientName =
    user?.name?.trim() || 'Client';

  const initials = clientName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const profileImage =
    user?.profileImage || user?.image || null;

  function isActive(href: string) {
    if (href === '/client') {
      return pathname === '/client';
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border bg-[#0b1120]">

      {/* BRAND / CLIENT HEADER */}
      <div className="flex h-[88px] shrink-0 items-center gap-3 border-b border-border px-5">

        {profileImage ? (
          <img
            src={profileImage}
            alt={`${clientName} profile`}
            className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-primary/30"
          />
        ) : (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">
            {initials || 'V'}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {clientName}
          </p>

          <p className="mt-0.5 text-xs text-text-secondary">
            Client
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-text-secondary group-hover:text-text-primary'
                  )}
                />

                <span className="flex-1">
                  {item.label}
                </span>

                {/* Notification badge */}
                {item.href === '/client/notifications' &&
                  data?.unread > 0 && (
                    <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
                      {data.unread > 99
                        ? '99+'
                        : data.unread}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM CLIENT INFO + LOGOUT */}
      <div className="shrink-0 border-t border-border">

        <div className="px-5 py-4">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-text-secondary">
            {clientName}
          </p>

          <p className="mt-1 text-xs text-text-secondary/70">
            CLIENT
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 border-t border-border px-5 py-4 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}