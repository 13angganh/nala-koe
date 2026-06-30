'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Download,
  X,
  Smile,
  Cloud,
  Zap,
  CloudRain,
  AlertCircle,
  Flame,
  Sparkles,
  Moon,
  Heart,
  MinusCircle,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, stripHtml } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import { getCardAccentColor, getTimeGradient } from '@/lib/color-gradient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MOOD_MAP } from '@/constants/moods';
import { animation } from '@/tokens/animation';
import type { Note } from '@/types/note.types';
import { useShare } from '@/hooks/use-share';

// ─── Icon map ────────────────────────────────────────────────────────────────

const MOOD_ICONS: Record<string, React.ElementType> = {
  smile: Smile,
  cloud: Cloud,
  zap: Zap,
  'cloud-rain': CloudRain,
  'alert-circle': AlertCircle,
  flame: Flame,
  sparkles: Sparkles,
  moon: Moon,
  heart: Heart,
  'minus-circle': MinusCircle,
};

// ─── Card style variants ──────────────────────────────────────────────────────

const CARD_STYLES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'gradient', label: 'Gradien' },
  { id: 'dark', label: 'Gelap' },
] as const;

type CardStyleId = (typeof CARD_STYLES)[number]['id'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface NoteShareCardProps {
  note: Note;
  open: boolean;
  onClose: () => void;
}

// ─── ShareCard preview ────────────────────────────────────────────────────────

interface CardPreviewProps {
  note: Note;
  styleId: CardStyleId;
  accentColor: string;
  gradient: ReturnType<typeof getTimeGradient>;
}

function CardPreview({ note, styleId, accentColor, gradient }: CardPreviewProps) {
  const moodOption = note.mood ? MOOD_MAP[note.mood] : null;
  const MoodIcon = moodOption ? (MOOD_ICONS[moodOption.icon] ?? MinusCircle) : null;
  const preview = stripHtml(note.content).slice(0, 240);

  const baseCard = 'relative overflow-hidden rounded-2xl p-6 w-full aspect-[4/3] flex flex-col gap-3 select-none';

  if (styleId === 'dark') {
    return (
      <div
        className={cn(baseCard, 'bg-[var(--surface-invert,#0f172a)] text-white')}
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ background: gradient.gradient }} />
        <header className="flex items-center justify-between gap-2 z-10">
          <span className="text-xs font-mono opacity-50">NalaKoe</span>
          {MoodIcon && moodOption && (
            <span style={{ color: moodOption.color }}>
              <MoodIcon className="h-4 w-4" aria-hidden />
            </span>
          )}
        </header>
        <h2 className="text-lg font-semibold leading-tight z-10 line-clamp-2">
          {note.title || 'Tanpa judul'}
        </h2>
        {preview && (
          <p className="text-sm opacity-60 leading-relaxed line-clamp-4 z-10">{preview}</p>
        )}
        <footer className="mt-auto flex items-center justify-between gap-2 z-10">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${accentColor}33`, color: accentColor }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <time className="text-xs opacity-40 tabular-nums shrink-0">
            {formatRelativeTime(note.createdAt)}
          </time>
        </footer>
      </div>
    );
  }

  if (styleId === 'gradient') {
    return (
      <div
        className={cn(baseCard, 'text-white')}
        style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}55), ${gradient.gradient}` }}
      >
        <header className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono opacity-70">NalaKoe</span>
          {MoodIcon && moodOption && (
            <span className="opacity-90">
              <MoodIcon className="h-4 w-4" aria-hidden />
            </span>
          )}
        </header>
        <h2 className="text-lg font-semibold leading-tight line-clamp-2 drop-shadow-sm">
          {note.title || 'Tanpa judul'}
        </h2>
        {preview && (
          <p className="text-sm opacity-80 leading-relaxed line-clamp-4">{preview}</p>
        )}
        <footer className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white"
              >
                #{tag}
              </span>
            ))}
          </div>
          <time className="text-xs opacity-60 tabular-nums shrink-0">
            {formatRelativeTime(note.createdAt)}
          </time>
        </footer>
      </div>
    );
  }

  // minimal
  return (
    <div
      className={cn(baseCard, 'bg-white dark:bg-[var(--surface-base)] border border-[var(--border)]')}
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <header className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-[var(--text-tertiary)]">NalaKoe</span>
        {MoodIcon && moodOption && (
          <span style={{ color: moodOption.color }}>
            <MoodIcon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </header>
      <h2 className="text-lg font-semibold leading-tight text-[var(--text-primary)] line-clamp-2">
        {note.title || 'Tanpa judul'}
      </h2>
      {preview && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-4">{preview}</p>
      )}
      <footer className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
              #{tag}
            </Badge>
          ))}
        </div>
        <time className="text-xs text-[var(--text-tertiary)] tabular-nums shrink-0">
          {formatRelativeTime(note.createdAt)}
        </time>
      </footer>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NoteShareCard({ note, open, onClose }: NoteShareCardProps) {
  const [styleId, setStyleId] = useState<CardStyleId>('minimal');
  const [isCapturing, setIsCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { share, canShare } = useShare();

  const accentColor = note.accentColor ?? getCardAccentColor(note.createdAt);
  const gradient = getTimeGradient(note.createdAt);

  // Download card as PNG using html-to-image (dynamic import to keep bundle small)
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `nalakoe-${note.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Kartu berhasil diunduh');
    } catch {
      toast.error('Gagal mengekspor kartu');
    } finally {
      setIsCapturing(false);
    }
  }, [note.id]);

  // Share via Web Share API (file share) or copy link
  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    if (canShare) {
      setIsCapturing(true);
      try {
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        // Convert data URL to Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `nalakoe-${note.id.slice(0, 8)}.png`, { type: 'image/png' });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: note.title || 'Catatan NalaKoe' });
        } else {
          // Fallback: share text
          await share({ title: note.title || 'Catatan NalaKoe', text: stripHtml(note.content).slice(0, 200) });
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Gagal berbagi kartu');
        }
      } finally {
        setIsCapturing(false);
      }
    } else {
      // Desktop fallback — copy title + snippet
      await share({ title: note.title || 'Catatan NalaKoe', text: stripHtml(note.content).slice(0, 200) });
    }
  }, [canShare, note, share]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl" aria-label="Bagikan catatan sebagai kartu">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Bagikan sebagai kartu</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Ekspor catatan sebagai gambar yang bisa dibagikan</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Tutup">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Style selector */}
        <div className="px-5 pt-4 flex gap-2" role="group" aria-label="Pilih gaya kartu">
          {CARD_STYLES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setStyleId(id)}
              aria-pressed={styleId === id}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                styleId === id
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/60'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card preview */}
        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={styleId}
              {...animation.variants.scaleIn}
              ref={cardRef}
            >
              <CardPreview
                note={note}
                styleId={styleId}
                accentColor={accentColor}
                gradient={gradient}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Language badge */}
        {note.language && (
          <div className="px-5 pb-1 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-[var(--text-tertiary)]" aria-hidden />
            <span className="text-xs text-[var(--text-tertiary)]">{note.language.toUpperCase()}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleDownload}
                isLoading={isCapturing}
                aria-label="Unduh sebagai PNG"
              >
                <Download className="h-4 w-4" />
                Unduh PNG
              </Button>
            </TooltipTrigger>
            <TooltipContent>Simpan sebagai gambar PNG beresolusi tinggi</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex-1 gap-2"
                onClick={handleShare}
                isLoading={isCapturing}
                aria-label="Bagikan kartu"
              >
                <Share2 className="h-4 w-4" />
                Bagikan
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canShare ? 'Bagikan via app lain' : 'Salin teks ke clipboard'}
            </TooltipContent>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  );
}
