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

  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!clean || value.includes(clean) || value.length >= maxTags) return;
    onChange([...value, clean]);
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIdx(-1);
    onSearchChange?.('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
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
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
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
            onRemove={disabled ? undefined : removeTag}
            size="sm"
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
              'flex-1 min-w-[80px] bg-transparent text-xs text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)] outline-none',
              'disabled:cursor-not-allowed'
            )}
            aria-label="Ketik tag baru"
            aria-autocomplete="list"
          />
        )}
        {!canAddMore && value.length >= maxTags && (
          <span className="text-[10px] text-[var(--text-tertiary)]">
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
            'rounded-lg border border-[var(--border)] bg-[var(--surface-overlay)]',
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
                'w-full text-left px-3 py-1.5 text-xs',
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
