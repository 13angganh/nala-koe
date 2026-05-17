import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
};

export function LoadingSpinner({ size = 'md', className, label = 'Memuat…' }: LoadingSpinnerProps) {
  return (
    <div role="status" className={cn('flex items-center justify-center', className)}>
      <span
        className={cn(
          'animate-spin rounded-full border-[var(--border-emphasis)] border-t-[var(--accent)]',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-base)]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
