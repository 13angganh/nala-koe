'use client';

import { HardDrive, Image as ImageIcon, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface NoteSizeIndicatorProps {
  totalBytes: number;
  hasImages: boolean;
  hasAudio: boolean;
  label: 'small' | 'medium' | 'large';
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LABEL_CONFIG = {
  small: {
    color: 'text-[var(--success)]',
    bgColor: 'bg-[var(--success)]/10',
    borderColor: 'border-[var(--success)]/20',
    text: 'Ringan',
  },
  medium: {
    color: 'text-[var(--warning)]',
    bgColor: 'bg-[var(--warning)]/10',
    borderColor: 'border-[var(--warning)]/20',
    text: 'Sedang',
  },
  large: {
    color: 'text-[var(--error)]',
    bgColor: 'bg-[var(--error)]/10',
    borderColor: 'border-[var(--error)]/20',
    text: 'Besar',
  },
} as const;

export function NoteSizeIndicator({
  totalBytes,
  hasImages,
  hasAudio,
  label,
  className,
}: NoteSizeIndicatorProps) {
  const config = LABEL_CONFIG[label];
  const tooltipContent = [
    `Estimasi ukuran: ${formatBytes(totalBytes)}`,
    hasImages ? 'Berisi gambar' : null,
    hasAudio ? 'Berisi audio' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium cursor-default',
            config.bgColor,
            config.borderColor,
            config.color,
            className
          )}
          aria-label={tooltipContent}
        >
          <HardDrive className="h-2.5 w-2.5 shrink-0" aria-hidden />
          <span>{config.text}</span>
          {hasImages && <ImageIcon className="h-2.5 w-2.5 shrink-0" aria-hidden />}
          {hasAudio && <Mic className="h-2.5 w-2.5 shrink-0" aria-hidden />}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}

/** Lightweight badge variant for note cards */
export function NoteSizeBadge({
  label,
  className,
}: {
  label: 'small' | 'medium' | 'large';
  className?: string;
}) {
  if (label === 'small') return null; // don't clutter cards with small indicator
  const config = LABEL_CONFIG[label];
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs px-1.5 py-0 h-4',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {label === 'large' ? 'Besar' : 'Sedang'}
    </Badge>
  );
}
