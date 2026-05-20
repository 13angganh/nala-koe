'use client';

import { useCallback } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

interface NoteChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export function NoteChecklist({ items, onChange, readOnly = false }: NoteChecklistProps) {
  const handleToggle = useCallback(
    (id: string) => {
      onChange(items.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item)));
    },
    [items, onChange]
  );

  const handleTextChange = useCallback(
    (id: string, text: string) => {
      onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
    },
    [items, onChange]
  );

  const handleAddItem = useCallback(() => {
    onChange([...items, { id: generateId(), text: '', isChecked: false }]);
  }, [items, onChange]);

  const handleRemove = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, id: string, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newItem = { id: generateId(), text: '', isChecked: false };
        const next = [...items];
        next.splice(index + 1, 0, newItem);
        onChange(next);
        // Focus next input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('[data-checklist-input]');
          inputs[index + 1]?.focus();
        }, 0);
      }
      if (e.key === 'Backspace' && !items[index]?.text && items.length > 1) {
        e.preventDefault();
        handleRemove(id);
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('[data-checklist-input]');
          inputs[Math.max(0, index - 1)]?.focus();
        }, 0);
      }
    },
    [items, onChange, handleRemove]
  );

  return (
    <div className="space-y-1.5" role="list" aria-label="Daftar checklist">
      {items.map((item, index) => (
        <div
          key={item.id}
          role="listitem"
          className="group flex items-center gap-2"
        >
          {/* Checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={item.isChecked}
            aria-label={item.isChecked ? 'Tandai belum selesai' : 'Tandai selesai'}
            disabled={readOnly}
            onClick={() => handleToggle(item.id)}
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
              'transition-colors duration-100 outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              item.isChecked
                ? 'border-[var(--accent)] bg-[var(--accent)]'
                : 'border-[var(--border)] hover:border-[var(--accent)]',
              readOnly && 'cursor-default'
            )}
          >
            {item.isChecked && (
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} aria-hidden="true" />
            )}
          </button>

          {/* Text */}
          {readOnly ? (
            <span
              className={cn(
                'flex-1 text-sm text-[var(--text-primary)]',
                item.isChecked && 'line-through text-[var(--text-tertiary)]'
              )}
            >
              {item.text || 'Item checklist'}
            </span>
          ) : (
            <input
              data-checklist-input
              type="text"
              value={item.text}
              onChange={(e) => handleTextChange(item.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, item.id, index)}
              placeholder="Item checklist…"
              className={cn(
                'flex-1 bg-transparent text-sm outline-none',
                'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                item.isChecked && 'line-through text-[var(--text-tertiary)]'
              )}
              aria-label={`Item ${index + 1}`}
            />
          )}

          {/* Delete */}
          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemove(item.id)}
              aria-label="Hapus item"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
              tabIndex={-1}
            >
              <Trash2 className="h-3 w-3 text-[var(--text-tertiary)]" />
            </Button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          onClick={handleAddItem}
          className={cn(
            'flex items-center gap-2 text-xs text-[var(--text-tertiary)]',
            'hover:text-[var(--text-secondary)] transition-colors duration-100',
            'outline-none focus-visible:text-[var(--accent)]'
          )}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Tambah item
        </button>
      )}
    </div>
  );
}
