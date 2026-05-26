'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { TagBadge } from './tag-badge';
import { useTags } from '@/hooks/use-tags';
import { Hash } from 'lucide-react';

// ─── Weight → visual scale ────────────────────────────────────────────────────

const WEIGHT_STYLES: Record<number, string> = {
  1: 'text-xs opacity-60',
  2: 'text-xs opacity-75',
  3: 'text-sm opacity-85',
  4: 'text-base',
  5: 'text-lg font-medium',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TagCloudProps {
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TagCloud({ onTagClick, activeTag, className }: TagCloudProps) {
  const { tagCloud, isLoading, fetchTagCloud } = useTags();

  useEffect(() => {
    void fetchTagCloud();
  }, [fetchTagCloud]);

  if (isLoading) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} aria-busy>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-6 rounded-md"
            style={{ width: `${40 + (i % 5) * 20}px` }}
          />
        ))}
      </div>
    );
  }

  if (tagCloud.length === 0) {
    return (
      <EmptyState
        icon={Hash}
        title="Belum ada tag"
        description="Tambahkan tag ke catatanmu untuk memulai."
        {...(className ? { className } : {})}
      />
    );
  }

  return (
    <div
      role="list"
      aria-label="Tag cloud"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {tagCloud.map((item) => (
        <span
          key={item.name}
          role="listitem"
          title={`${item.count} catatan`}
          className={cn(
            WEIGHT_STYLES[item.weight] ?? WEIGHT_STYLES[3],
            'transition-transform duration-100',
            'hover:scale-105',
            onTagClick && 'cursor-pointer'
          )}
        >
          <TagBadge
            tag={item.name}
            isActive={activeTag === item.name}
            size={item.weight >= 4 ? 'md' : 'sm'}
            {...(onTagClick ? { onClick: onTagClick } : {})}
          />
        </span>
      ))}
    </div>
  );
}
