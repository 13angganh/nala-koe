'use client';

import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { ROUTES } from '@/constants/routes';

interface TagCloudVisualProps {
  tags: { tag: string; count: number }[];
  isLoading: boolean;
}

function tagFontSize(count: number, max: number): string {
  if (max === 0) return 'text-sm';
  const ratio = count / max;
  if (ratio >= 0.8) return 'text-2xl font-semibold';
  if (ratio >= 0.6) return 'text-xl font-medium';
  if (ratio >= 0.4) return 'text-base font-medium';
  if (ratio >= 0.2) return 'text-sm';
  return 'text-sm';
}

function tagOpacity(count: number, max: number): number {
  if (max === 0) return 0.6;
  return 0.4 + (count / max) * 0.6;
}

export function TagCloudVisual({ tags, isLoading }: TagCloudVisualProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="Belum ada tag"
        description="Tambahkan tag pada catatanmu untuk melihat tag cloud di sini."
      />
    );
  }

  const max = tags[0]?.count ?? 1;

  // Shuffle tags so the cloud looks natural (not sorted by size)
  const shuffled = [...tags].sort(() => Math.random() - 0.5);

  function handleTagClick(tag: string) {
    router.push(`${ROUTES.NOTES}?tag=${encodeURIComponent(tag)}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {shuffled.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={cn(
            'rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[var(--accent)] transition-all duration-150 hover:bg-[var(--accent-subtle)] hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            tagFontSize(count, max)
          )}
          style={{ opacity: tagOpacity(count, max) }}
          title={`${tag} · ${count} catatan`}
          aria-label={`Filter catatan dengan tag ${tag}, ${count} catatan`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
