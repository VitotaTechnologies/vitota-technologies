'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  AlertCircle,
  Users,
  FolderKanban,
  MessageSquare,
  CreditCard,
  Briefcase,
  Image as ImageIcon,
  Star,
  UserCircle,
  Bell,
  Settings,
  FileClock,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/leads',
    label: 'Leads',
    icon: Inbox,
  },
  {
    href: '/admin/leads?filter=urgent',
    label: 'Urgent Leads',
    icon: AlertCircle,
  },
  {
    href: '/admin/clients',
    label: 'Clients',
    icon: Users,
  },
  {
    href: '/admin/projects',
    label: 'Projects',
    icon: FolderKanban,
  },
  {
    href: '/admin/messages',
    label: 'Messages',
    icon: MessageSquare,
  },
  {
    href: '/admin/payments',
    label: 'Payments',
    icon: CreditCard,
  },
  {
    href: '/admin/services',
    label: 'Services',
    icon: Briefcase,
  },
  {
    href: '/admin/portfolio',
    label: 'Portfolio',
    icon: ImageIcon,
  },
  {
    href: '/admin/testimonials',
    label: 'Testimonials',
    icon: Star,
  },
  {
    href: '/admin/leadership',
    label: 'Leadership',
    icon: UserCircle,
  },
  {
    href: '/admin/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    href: '/admin/audit-logs',
    label: 'Audit Logs',
    icon: FileClock,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function AdminSidebar({
  user,
}: {
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    window.location.href = '/login';
  }

  const content = (
    <nav className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground">
          V
        </span>

        <span className="font-semibold">
          Vitota Admin
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((it) => {
          const Icon = it.icon;

          const basePath = it.href.split('?')[0];

          const active =
            pathname === it.href ||
            (basePath !== '/admin' &&
              pathname.startsWith(basePath));

          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User / Logout */}
      <div className="border-t border-border p-4">
        <div className="mb-3 px-2 text-xs text-text-muted">
          {user.name} · {user.role}
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:border-r lg:border-border lg:bg-background-secondary">
        {content}
      </aside>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-lg border border-border bg-background lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-background-secondary">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>

            {content}
          </aside>
        </div>
      )}
    </>
  );
}