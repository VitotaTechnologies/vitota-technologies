import { cn } from '@/lib/utils';

const toneMap: Record<string, { classes: string; icon: string }> = {
  NEW: { classes: 'bg-primary/15 text-primary border-primary/30', icon: '•' },
  CONTACTED: { classes: 'bg-accent/15 text-accent border-accent/30', icon: '◦' },
  DISCUSSION: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '◐' },
  PROPOSAL: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '◑' },
  CONVERTED: { classes: 'bg-success/15 text-success border-success/30', icon: '✓' },
  CLOSED: { classes: 'bg-text-muted/15 text-text-muted border-border', icon: '×' },
  ACTIVE: { classes: 'bg-success/15 text-success border-success/30', icon: '✓' },
  PENDING: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '…' },
  PENDING_VERIFICATION: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '…' },
  SUSPENDED: { classes: 'bg-danger/15 text-danger border-danger/30', icon: '⚠' },
  DEACTIVATED: { classes: 'bg-text-muted/15 text-text-muted border-border', icon: '×' },
  PAID: { classes: 'bg-success/15 text-success border-success/30', icon: '✓' },
  PARTIALLY_PAID: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '◐' },
  OVERDUE: { classes: 'bg-danger/15 text-danger border-danger/30', icon: '⚠' },
  PLANNING: { classes: 'bg-primary/15 text-primary border-primary/30', icon: '◇' },
  DESIGN: { classes: 'bg-accent/15 text-accent border-accent/30', icon: '◈' },
  DEVELOPMENT: { classes: 'bg-primary/15 text-primary border-primary/30', icon: '⚙' },
  TESTING: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '⌘' },
  DEPLOYMENT: { classes: 'bg-accent/15 text-accent border-accent/30', icon: '⬢' },
  COMPLETED: { classes: 'bg-success/15 text-success border-success/30', icon: '✓' },
  ON_HOLD: { classes: 'bg-warning/15 text-warning border-warning/30', icon: '⏸' },
  IN_PROGRESS: { classes: 'bg-primary/15 text-primary border-primary/30', icon: '◐' },
  DRAFT: { classes: 'bg-text-muted/15 text-text-muted border-border', icon: '✎' },
  PUBLISHED: { classes: 'bg-success/15 text-success border-success/30', icon: '✓' },
  ARCHIVED: { classes: 'bg-text-muted/15 text-text-muted border-border', icon: '⌬' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = toneMap[status] ?? { classes: 'bg-surface text-text-secondary border-border', icon: '•' };
  const label = status.replace(/_/g, ' ');
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', tone.classes, className)}>
      <span aria-hidden>{tone.icon}</span>
      <span>{label}</span>
    </span>
  );
}