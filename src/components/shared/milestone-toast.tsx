'use client';

import { useEffect, useRef } from 'react';
import { Flame, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '@/tokens/colors';

interface MilestoneToastProps {
  streak: number;
  className?: string;
}

const MILESTONE_CONFIG: Record<
  number,
  { label: string; icon: React.ElementType; color: string; message: string }
> = {
  3: {
    label: '3 Hari',
    icon: Star,
    color: colors.brand[500],          // #0ea5e9 — sky blue
    message: 'Awal yang bagus! Pertahankan ritme menulismu.',
  },
  7: {
    label: '1 Minggu',
    icon: Flame,
    color: '#f97316',                   // reason: tidak ada orange token di tokens/colors; warna semantik streak
    message: 'Seminggu penuh! Kebiasaan menulismu mulai terbentuk.',
  },
  14: {
    label: '2 Minggu',
    icon: Flame,
    color: colors.semantic.error.DEFAULT, // #dc2626 — merah streak panas
    message: 'Dua minggu tanpa henti. Luar biasa!',
  },
  30: {
    label: '30 Hari',
    icon: Trophy,
    color: colors.semantic.warning.light,  // #fbbf24 — emas trophy
    message: 'Sebulan penuh! Kamu adalah penulis sejati.',
  },
  50: {
    label: '50 Hari',
    icon: Trophy,
    color: '#8b5cf6',                   // reason: tidak ada violet token di tokens/colors; warna semantik milestone
    message: '50 hari berturut-turut. Pencapaian luar biasa!',
  },
  100: {
    label: '100 Hari',
    icon: Trophy,
    color: '#ec4899',                   // reason: tidak ada pink token di tokens/colors; warna semantik pencapaian tertinggi
    message: '100 hari! Kamu telah mengukir sejarah NalaKoe-mu.',
  },
};

function launchConfetti(canvas: HTMLCanvasElement, color: string) {
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: rawCtx checked above, reassignment needed for draw() closure
  const ctx = rawCtx;

  const W = canvas.width;
  const H = canvas.height;
  const COUNT = 80;

  type Particle = {
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngle: number;
    tiltAngleDelta: number;
  };

  const palette = [
    color,
    colors.brand[500],                // #0ea5e9
    '#f97316',                        // reason: tidak ada orange token di tokens/colors
    colors.semantic.warning.light,    // #fbbf24
    colors.semantic.success.DEFAULT,  // #16a34a
    '#8b5cf6',                        // reason: tidak ada violet token di tokens/colors
  ];

  const particles: Particle[] = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H - H,
    r: Math.random() * 8 + 4,
    d: Math.random() * COUNT + 11,
    color: palette[Math.floor(Math.random() * palette.length)] ?? color,
    tilt: Math.floor(Math.random() * 10) - 10,
    tiltAngle: 0,
    tiltAngleDelta: (Math.random() * 0.07 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
  }));

  let angle = 0;
  let frame = 0;
  const MAX_FRAMES = 120;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    angle += 0.01;
    frame++;

    for (const p of particles) {
      p.tiltAngle += p.tiltAngleDelta;
      p.y += (Math.cos(angle + p.d) + 2 + p.r / 2) * 1.5;
      p.x += Math.sin(angle) * 1.2;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    }

    if (frame < MAX_FRAMES) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  draw();
}

export function MilestoneToast({ streak, className }: MilestoneToastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = MILESTONE_CONFIG[streak];

  useEffect(() => {
    if (canvasRef.current && config) {
      launchConfetti(canvasRef.current, config.color);
    }
  }, [config]);

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--border)]',
        'bg-[var(--surface-base)] shadow-[var(--shadow-md)]',
        'p-4 w-72',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        width={288}
        height={120}
        className="pointer-events-none absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Streak {config.label}!
            </p>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {streak} hari
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-snug">
            {config.message}
          </p>
        </div>
      </div>
    </div>
  );
}
