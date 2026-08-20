'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TagBadge } from './tag-badge';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  onSearchChange?: (query: string) => void;
  maxTags?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TagInput({
  value,
  onChange,
  suggestions = [],
  onSearchChange,
  maxTags = 10,
  disabled = false,
  placeholder = 'Tambah tag...',
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Root cause of the reported "tag tetap hilang, di catatan lama maupun
  // baru": addTag()/removeTag() used to read `value` directly from this
  // component's render closure. `value` is a CONTROLLED prop coming from
  // Zustand via several layers (NoteEditor -> NoteMetaPanel, which is
  // wrapped in React.memo — see note-meta-panel.tsx) — there is a real
  // gap between calling onChange() and this component actually
  // re-rendering with the updated `value`. If the user types a second tag
  // and hits Enter again inside that gap (typing two tags in quick
  // succession — an entirely normal thing to do, not an edge case), the
  // second addTag() call closes over the STALE pre-update `value`, so
  // onChange([...staleValue, secondTag]) silently overwrites the first
  // tag instead of keeping it. No error, no crash — just a note that ends
  // up with only the last tag typed, or none at all if the user was fast
  // enough for this to happen on the very first tag. Confirmed via a
  // failing-until-fixed test in tests/unit/components/tag-input.test.tsx
  // BEFORE this fix, following this project's standing tests-before-fix
  // approach for bug reports (see README.md v1.2.5/v1.2.6 changelog).
  //
  // valueRef is the array addTag/removeTag build their next result from.
  // It's kept in sync with the `value` prop via useEffect — deliberately
  // NOT by assigning valueRef.current = value directly in the render
  // body. React's own docs are explicit that refs shouldn't be written
  // during rendering (https://react.dev/learn/referencing-values-with-refs)
  // and this component demonstrates exactly why: an unconditional
  // render-body assignment re-runs on EVERY render this component does
  // for ANY reason — including the ones setInputValue('') triggers while
  // the user is mid-keystroke on the NEXT tag — and each of those re-runs
  // was re-adopting the ORIGINAL `value` prop (since the parent hadn't
  // re-rendered with the updated array yet), silently discarding the tag
  // valueRef was just updated to include. useEffect's dependency array
  // ([value]) is what correctly limits the sync to only when `value`
  // itself actually changes between renders — not every render.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    const current = valueRef.current;
    if (!clean || current.includes(clean) || current.length >= maxTags) {
      return;
    }
    const next = [...current, clean];
    // Also updated directly here (not just via the useEffect above) so a
    // SECOND addTag()/removeTag() call arriving before React commits a
    // re-render from THIS call still builds from the up-to-date array.
    // The useEffect handles the OTHER direction — value changing from
    // outside (a different note opened, a live update arriving) — while
    // this direct assignment handles our own calls staying correct
    // against each other even when several fire faster than a render.
    valueRef.current = next;
    onChange(next);
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIdx(-1);
    onSearchChange?.('');
  }

  function removeTag(tag: string) {
    const next = valueRef.current.filter((t) => t !== tag);
    valueRef.current = next;
    onChange(next);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setInputValue(v);
    setShowSuggestions(v.length > 0 || filteredSuggestions.length > 0);
    setHighlightedIdx(-1);
    onSearchChange?.(v);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlightedIdx >= 0 && filteredSuggestions[highlightedIdx]) {
        addTag(filteredSuggestions[highlightedIdx]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && valueRef.current.length > 0) {
      // Same valueRef.current pattern as addTag/removeTag above (was
      // reading the `value` prop directly here before — a stale closure
      // this project already fixed for addTag/removeTag but this branch
      // was missed at the time; confirmed by a failing-before-fix test in
      // tests/unit/components/tag-input.test.tsx).
      const next = valueRef.current.slice(0, -1);
      valueRef.current = next;
      onChange(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIdx(-1);
    }
  }

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const canAddMore = !disabled && value.length < maxTags;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input area */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-[36px]',
          'rounded-lg border border-[var(--border)] bg-[var(--surface-base)]',
          'px-2.5 py-1.5 cursor-text',
          'transition-colors duration-100',
          'focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {value.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            size="sm"
            {...(!disabled ? { onRemove: removeTag } : {})}
          />
        ))}
        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0 || suggestions.length > 0)}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 min-w-[80px] bg-transparent text-sm text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)] outline-none',
              'disabled:cursor-not-allowed'
            )}
            aria-label="Ketik tag baru"
            aria-autocomplete="list"
          />
        )}
        {!canAddMore && value.length >= maxTags && (
          <span className="text-sm text-[var(--text-tertiary)]">
            Maks {maxTags} tag
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="Saran tag"
          className={cn(
            'absolute top-full left-0 right-0 z-[var(--z-dropdown)] mt-1',
            'rounded-lg border border-[var(--border)] bg-[var(--surface-base)]',
            'shadow-[var(--shadow-md)] py-1 max-h-48 overflow-y-auto'
          )}
        >
          {filteredSuggestions.map((suggestion, idx) => (
            <button
              key={suggestion}
              role="option"
              aria-selected={idx === highlightedIdx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion);
              }}
              onMouseEnter={() => setHighlightedIdx(idx)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm',
                'text-[var(--text-primary)] transition-colors',
                idx === highlightedIdx
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'hover:bg-[var(--surface-subtle)]'
              )}
            >
              #{suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
