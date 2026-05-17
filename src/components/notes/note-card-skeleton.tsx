import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface NoteCardSkeletonProps {
  className?: string;
}

export function NoteCardSkeleton({ className }: NoteCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 space-y-3',
        className
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-5/6 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-3 w-12 rounded-full" />
      </div>
    </div>
  );
}
