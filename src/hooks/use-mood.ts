'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { getMoodStats, getMoodMonthlyInsight } from '@/services/mood.service';
import type { MoodStat, MoodMonthlyInsight } from '@/services/mood.service';
import type { MoodId } from '@/types/mood.types';
import { MOODS, MOOD_MAP } from '@/constants/moods';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseMoodReturn {
  moods: typeof MOODS;
  getMoodOption: (id: MoodId) => (typeof MOODS)[number] | undefined;
  stats: MoodStat[];
  monthlyInsight: MoodMonthlyInsight | null;
  isLoadingStats: boolean;
  fetchStats: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMood(): UseMoodReturn {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<MoodStat[]>([]);
  const [monthlyInsight, setMonthlyInsight] = useState<MoodMonthlyInsight | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingStats(true);
    try {
      const [statsResult, insightResult] = await Promise.all([
        getMoodStats(user.uid),
        getMoodMonthlyInsight(user.uid),
      ]);
      if (statsResult.data) setStats(statsResult.data);
      if (insightResult.data) setMonthlyInsight(insightResult.data);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const getMoodOption = useCallback(
    (id: MoodId) => MOOD_MAP[id],
    []
  );

  return {
    moods: MOODS,
    getMoodOption,
    stats,
    monthlyInsight,
    isLoadingStats,
    fetchStats,
  };
}
