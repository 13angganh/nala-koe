'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ExternalLink, Link2, Loader2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUrlMeta } from '@/hooks/use-url-meta';
import { Button } from '@/components/ui/button';
import type { UrlMeta } from '@/hooks/use-url-meta';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UrlPreviewData {
  url: string;
  meta: UrlMeta | null;
  /** Cached at time of creation — don't refetch on every render */
  cachedAt: string;
}

interface NoteUrlPreviewProps {
  /** If previewData exists, render cached. Otherwise show fetch UI. */
  previewData: UrlPreviewData | null;
  rawUrl: string;
  onPreviewFetched: (data: UrlPreviewData) => void;
  onRemove: () => void;
  /**
   * Hides this component's own internal delete (X) buttons across all three
   * render states (unfetched/error/preview-card). Use when the parent
   * already renders its own delete control elsewhere (e.g.
   * NoteBlockHeader's trash icon in note-blocks-renderer.tsx) so there's
   * exactly one delete affordance per block, not two competing ones.
   * Does NOT affect fetch/retry behavior — "Pratinjau" and "Coba lagi"
   * still render and work normally.
   */
  hideRemoveButton?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteUrlPreview({
  previewData,
  rawUrl,
  onPreviewFetched,
  onRemove,
  hideRemoveButton = false,
  className,
}: NoteUrlPreviewProps) {
  const { fetchMeta, isFetching, error } = useUrlMeta();
  const [imgError, setImgError] = useState(false);

  const handleFetch = useCallback(async () => {
    const meta = await fetchMeta(rawUrl);
    if (meta) {
      onPreviewFetched({
        url: rawUrl,
        meta,
        cachedAt: new Date().toISOString(),
      });
    }
  }, [fetchMeta, onPreviewFetched, rawUrl]);

  const meta = previewData?.meta ?? null;
  const hasImage = !imgError && !!meta?.image;

  // ── Unfetched state ──────────────────────────────────────────────────────
  if (!previewData) {
    return (
      <div
        className={cn(
          'rounded-lg border border-[var(--border)] border-dashed',
          'bg-[var(--surface-subtle)] p-3',
          'flex items-center gap-3',
          className
        )}
      >
        <Link2 className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" aria-hidden="true" />
        <span className="flex-1 min-w-0 text-sm text-[var(--text-secondary)] truncate">{rawUrl}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleFetch()}
          disabled={isFetching}
          className="h-7 text-xs gap-1.5 shrink-0"
        >
          {isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {isFetching ? 'Memuat…' : 'Pratinjau'}
        </Button>
        {!hideRemoveButton && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Hapus link"
            className={cn(
              'p-1 text-[var(--text-tertiary)] hover:text-[var(--error)]',
              'outline-none focus-visible:ring-1 focus-visible:ring-[var(--error)] rounded',
              'shrink-0'
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !previewData) {
    return (
      <div
        className={cn(
          'rounded-lg border border-[var(--error)]/30 bg-[var(--surface-subtle)]',
          'p-3 flex items-center gap-2 text-xs text-[var(--error)]',
          className
        )}
        role="alert"
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{error}</span>
        <Button variant="ghost" size="sm" onClick={() => void handleFetch()} className="h-6 text-xs">
          Coba lagi
        </Button>
        {!hideRemoveButton && (
          <button type="button" onClick={onRemove} aria-label="Hapus link" className="p-1 hover:text-[var(--error)] rounded outline-none focus-visible:ring-1 focus-visible:ring-[var(--error)]">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  // ── Preview card ─────────────────────────────────────────────────────────
  const href = previewData?.url ?? rawUrl;

  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] overflow-hidden',
        'bg-[var(--surface-base)]',
        'group relative',
        className
      )}
    >
      {/* Remove button */}
      {!hideRemoveButton && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus link preview"
          className={cn(
            'absolute top-2 right-2 z-10',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'p-1 rounded bg-[var(--surface-base)]/80 backdrop-blur-sm',
            'text-[var(--text-tertiary)] hover:text-[var(--error)]',
            'outline-none focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-[var(--error)]'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg"
        aria-label={`Buka ${meta?.title ?? href}`}
      >
        {/* Image */}
        {hasImage && meta?.image && (
          <div className="relative w-28 shrink-0 bg-[var(--surface-subtle)]">
            <Image
              src={meta.image}
              alt={meta.title ?? ''}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              sizes="112px"
            />
          </div>
        )}

        {/* Text content */}
        <div className={cn('flex-1 min-w-0 p-3 space-y-1', hasImage && 'border-l border-[var(--border)]')}>
          {/* Site name + favicon */}
          <div className="flex items-center gap-1.5">
            {meta?.favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.favicon}
                alt=""
                aria-hidden="true"
                width={12}
                height={12}
                className="h-3 w-3 rounded-sm object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <span className="text-xs text-[var(--text-tertiary)] truncate">
              {meta?.siteName ?? hostOf(href)}
            </span>
            <ExternalLink className="h-3 w-3 text-[var(--text-tertiary)] ml-auto shrink-0" aria-hidden="true" />
          </div>

          {/* Title */}
          {meta?.title && (
            <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">
              {meta.title}
            </p>
          )}

          {/* Description */}
          {meta?.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {meta.description}
            </p>
          )}

          {/* Fallback: just the URL */}
          {!meta?.title && !meta?.description && (
            <p className="text-xs text-[var(--text-tertiary)] truncate">{href}</p>
          )}
        </div>
      </a>
    </div>
  );
}
