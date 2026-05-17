import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
        secondary: 'bg-[var(--surface-muted)] text-[var(--text-secondary)]',
        success: 'bg-[var(--success-subtle)] text-[var(--success)]',
        warning: 'bg-[var(--warning-subtle)] text-[var(--warning)]',
        error: 'bg-[var(--error-subtle)] text-[var(--error)]',
        info: 'bg-[var(--info-subtle)] text-[var(--info)]',
        outline: 'border border-[var(--border)] text-[var(--text-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
