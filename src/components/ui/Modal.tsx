'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function Modal({
  open, onClose, title, children, footer, className,
}: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; footer?: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div ref={ref} className={cn('glass-strong relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6', className)}>
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}