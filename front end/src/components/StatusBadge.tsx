import { cn } from '@/lib/utils';

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled' | 'deleted';

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-warning/15 text-warning border-warning/20' },
  completed: { label: 'Completed', className: 'bg-success/15 text-success border-success/20' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/15 text-destructive border-destructive/20' },
  deleted:   { label: 'Deleted',   className: 'bg-muted text-muted-foreground border-border' },
};

const fallback = statusConfig.pending;

export const StatusBadge = ({ status }: { status?: string }) => {
  const config = statusConfig[status as AppointmentStatus] ?? fallback;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  );
};
