import { AdminAccess } from '@/components/public/AdminAccess';

import Link from 'next/link';
import { env } from '@/lib/env';

export function Footer() {
  const officialUrl = env.NEXT_PUBLIC_VITOTA_MAIN_WEBSITE_URL || '';

  return (
    <footer className="relative mt-24 border-t border-border bg-background-secondary/60">
      <AdminAccess />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
              V
            </span>
            <span>Vitota Technologies</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-text-secondary">
            Premium technology solutions — web development, custom software, and digital systems engineered for growth.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li><Link href="/about" className="hover:text-text-primary">About</Link></li>
            <li><Link href="/services" className="hover:text-text-primary">Services</Link></li>
            <li><Link href="/portfolio" className="hover:text-text-primary">Portfolio</Link></li>
            <li><Link href="/contact" className="hover:text-text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li><Link href="/terms" className="hover:text-text-primary">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-text-muted sm:px-6 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Vitota Technologies. All rights reserved.</p>
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <span>Manage and Develop &gt;&gt; Vitota Technologies</span>
            {officialUrl ? (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-primary/40 px-3 py-1.5 text-primary hover:bg-primary/10"
              >
                Visit Vitota Technologies
              </a>
            ) : (
              <span className="rounded-lg border border-border px-3 py-1.5 text-text-muted">
                Visit Vitota Technologies
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}