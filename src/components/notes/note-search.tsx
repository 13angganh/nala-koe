'use client';

import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NoteSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function NoteSearch({ value, onChange, className }: NoteSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        className="absolute left-3 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari catatan…"
        aria-label="Cari catatan"
        className={cn(
          'h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]',
          'pl-9 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'outline-none transition-colors duration-[var(--duration-fast)]',
          'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
          'hover:border-[var(--border-emphasis)]'
        )}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-1"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="Hapus pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
