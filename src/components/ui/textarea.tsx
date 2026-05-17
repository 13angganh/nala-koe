import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[var(--shadow-xs)] transition-colors resize-none',
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
Textarea.displayName = 'Textarea';

export { Textarea };
