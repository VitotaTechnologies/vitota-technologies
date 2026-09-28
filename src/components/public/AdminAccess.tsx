'use client';

import { useState } from 'react';
import Link from 'next/link';

export function AdminAccess() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute left-0 bottom-12 z-50">
      <div className="flex items-center">

        {/* Arrow */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open admin access"
          className="
            flex h-14 w-10 items-center justify-center
            rounded-r-xl
            border border-l-0 border-border
            bg-background-secondary
            text-text-secondary
            shadow-lg
            transition-all duration-300
            hover:bg-primary/10
            hover:text-primary
          "
        >
          <span
            className={`text-xl transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          >
            ›
          </span>
        </button>

        {/* Admin Login Button */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${open ? 'ml-2 max-w-[180px] opacity-100' : 'ml-0 max-w-0 opacity-0'}
          `}
        >
          <Link
            href="/admin-login"
            className="
              block whitespace-nowrap
              rounded-xl
              border border-primary/40
              bg-background-secondary
              px-5 py-3
              text-sm font-semibold
              text-primary
              shadow-lg
              transition-all duration-200
              hover:border-primary
              hover:bg-primary/10
            "
          >
            Admin Login
          </Link>
        </div>

      </div>
    </div>
  );
}