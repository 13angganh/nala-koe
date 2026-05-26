'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadAloud } from '@/hooks/use-read-aloud';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteReadAloudProps {
  /** Plain-text content to read (HTML stripped by parent) */
  text: string;
  title?: string;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRate(rate: number): string {
  return `${rate.toFixed(1)}×`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteReadAloud({ text, title, className }: NoteReadAloudProps) {
  const {
    isSupported,
    status,
    voices,
    selectedVoice,
    rate,
    progress,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
  } = useReadAloud();

  const [showSettings, setShowSettings] = useState(false);

  // Stop reading when component unmounts
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const fullText = title ? `${title}. ${text}` : text;

  const handlePlayPause = useCallback(() => {
    if (status === 'idle') {
      speak(fullText);
    } else if (status === 'playing') {
      pause();
    } else {
      resume();
    }
  }, [status, fullText, speak, pause, resume]);

  if (!isSupported) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-xs text-[var(--text-tertiary)]',
          className
        )}
        role="note"
      >
        <VolumeX className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Baca keras tidak didukung di browser ini.
      </div>
    );
  }

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isActive = isPlaying || isPaused;

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]',
        'overflow-hidden transition-all',
        className
      )}
      role="region"
      aria-label="Baca keras catatan"
    >
      {/* Main control row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Icon */}
        <Volume2
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isPlaying ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
          )}
          aria-hidden="true"
        />

        {/* Progress bar */}
        <div
          className="flex-1 min-w-0"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progres membaca: ${Math.round(progress * 100)}%`}
        >
          <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isPlaying ? 'bg-[var(--accent)]' : 'bg-[var(--text-tertiary)]'
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Status label */}
        <span className="text-xs text-[var(--text-tertiary)] shrink-0 w-12 text-right">
          {isPlaying ? 'Membaca…' : isPaused ? 'Dijeda' : 'Siap'}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Jeda' : isPaused ? 'Lanjutkan' : 'Putar'}
                aria-pressed={isActive}
                className={cn(isActive && 'text-[var(--accent)]')}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? 'Jeda' : isPaused ? 'Lanjutkan' : 'Putar'}
            </TooltipContent>
          </Tooltip>

          {isActive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={stop}
                  aria-label="Stop"
                >
                  <Square className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowSettings((v) => !v)}
                aria-label="Pengaturan suara"
                aria-expanded={showSettings}
                className={cn(showSettings && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pengaturan suara</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-t border-[var(--border)] px-3 py-2.5 space-y-3">
          {/* Speed control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                Kecepatan
              </span>
              <span className="text-xs text-[var(--accent)] font-medium font-mono">
                {formatRate(rate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[var(--text-tertiary)] w-8">0.5×</span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.25}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                aria-label={`Kecepatan baca: ${formatRate(rate)}`}
                className={cn(
                  'flex-1 h-1.5 rounded-full appearance-none cursor-pointer',
                  'accent-[var(--accent)]',
                  'bg-[var(--border)]'
                )}
              />
              <span className="text-[9px] text-[var(--text-tertiary)] w-6">3×</span>
            </div>
          </div>

          {/* Voice selector */}
          {voices.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide block">
                Suara
              </span>
              <select
                value={selectedVoice?.voiceURI ?? ''}
                onChange={(e) => {
                  const v = voices.find((v) => v.voiceURI === e.target.value);
                  if (v) setVoice(v);
                }}
                aria-label="Pilih suara"
                className={cn(
                  'w-full rounded-lg border border-[var(--border)]',
                  'bg-[var(--surface-base)] text-[var(--text-primary)]',
                  'px-2.5 py-1.5 text-xs',
                  'outline-none focus:ring-1 focus:ring-[var(--accent)]'
                )}
              >
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
