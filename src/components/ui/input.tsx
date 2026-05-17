import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[var(--shadow-xs)] transition-colors',
          'placeholder:text-[var(--text-tertiary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:border-[var(--accent)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-[var(--error)] focus-visible:ring-[var(--error)]'
            : 'border-[var(--border)]',
          className
        )}
        aria-invalid={error}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
