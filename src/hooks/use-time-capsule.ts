'use client';

import { useCallback, useMemo } from 'react';
import { differenceInSeconds, differenceInDays, isPast, parseISO } from 'date-fns';
import { CONFIG } from '@/constants/config';

export interface TimeCapsuleStatus {
  isLocked: boolean;
  isUnlocked: boolean;
  unlockAt: Date | null;
  daysRemaining: number;
  secondsRemaining: number;
  formattedCountdown: string;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Sekarang';

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m ${s}d`;
  return `${m}m ${s}d`;
}

export function useTimeCapsule(
  isTimeCapsule: boolean,
  timeCapsuleUnlockAt: string | null
) {
  const status = useMemo<TimeCapsuleStatus>(() => {
    if (!isTimeCapsule || !timeCapsuleUnlockAt) {
      return {
        isLocked: false,
        isUnlocked: false,
        unlockAt: null,
        daysRemaining: 0,
        secondsRemaining: 0,
        formattedCountdown: '',
      };
    }

    const unlockAt = parseISO(timeCapsuleUnlockAt);
    const isUnlocked = isPast(unlockAt);
    const secondsRemaining = isUnlocked ? 0 : Math.max(0, differenceInSeconds(unlockAt, new Date()));
    const daysRemaining = isUnlocked ? 0 : Math.max(0, differenceInDays(unlockAt, new Date()));

    return {
      isLocked: !isUnlocked,
      isUnlocked,
      unlockAt,
      daysRemaining,
      secondsRemaining,
      formattedCountdown: formatCountdown(secondsRemaining),
    };
  }, [isTimeCapsule, timeCapsuleUnlockAt]);

  /**
   * Validates a date for time capsule.
   * Returns error message string or null if valid.
   */
  const validateUnlockDate = useCallback((date: Date): string | null => {
    const now = new Date();
    const diffDays = differenceInDays(date, now);

    if (diffDays < CONFIG.MIN_TIME_CAPSULE_DAYS) {
      return `Tanggal harus minimal ${CONFIG.MIN_TIME_CAPSULE_DAYS} hari dari sekarang.`;
    }
    if (diffDays > CONFIG.MAX_TIME_CAPSULE_YEARS * 365) {
      return `Tanggal maksimal ${CONFIG.MAX_TIME_CAPSULE_YEARS} tahun dari sekarang.`;
    }
    return null;
  }, []);

  return { status, validateUnlockDate };
}
