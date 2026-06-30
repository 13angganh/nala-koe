'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { isOk } from '@/lib/normalizer';
import {
  getWritingStats,
  getMoodInsights,
  getMonthlyStats,
  getWeeklyActivity,
  getTagFrequency,
  getScheduledNotes,
} from '@/services/stats.service';
import type {
  WritingStats,
  MoodInsight,
  MonthlyStats,
  WeeklyActivity,
} from '@/types/stats.types';

const STALE = 5 * 60_000; // 5 minutes

export function useWritingStats() {
  const { user } = useAuthStore();
  return useQuery<WritingStats | null>({
    queryKey: ['stats', 'writing', user?.uid],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const res = await getWritingStats(user!.uid);
      return isOk(res) ? res.data : null;
    },
    enabled: !!user?.uid,
    staleTime: STALE,
  });
}

export function useMoodInsights() {
  const { user } = useAuthStore();
  return useQuery<MoodInsight[]>({
    queryKey: ['stats', 'mood', user?.uid],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const res = await getMoodInsights(user!.uid);
      return isOk(res) ? res.data : [];
    },
    enabled: !!user?.uid,
    staleTime: STALE,
  });
}

export function useMonthlyStats(months = 6) {
  const { user } = useAuthStore();
  return useQuery<MonthlyStats[]>({
    queryKey: ['stats', 'monthly', user?.uid, months],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const res = await getMonthlyStats(user!.uid, months);
      return isOk(res) ? res.data : [];
    },
    enabled: !!user?.uid,
    staleTime: STALE,
  });
}

export function useWeeklyActivity(days = 30) {
  const { user } = useAuthStore();
  return useQuery<WeeklyActivity[]>({
    queryKey: ['stats', 'weekly', user?.uid, days],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const res = await getWeeklyActivity(user!.uid, days);
      return isOk(res) ? res.data : [];
    },
    enabled: !!user?.uid,
    staleTime: STALE,
  });
}

export function useTagFrequency() {
  const { user } = useAuthStore();
  return useQuery<{ tag: string; count: number }[]>({
    queryKey: ['stats', 'tags', user?.uid],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const res = await getTagFrequency(user!.uid);
      return isOk(res) ? res.data : [];
    },
    enabled: !!user?.uid,
    staleTime: STALE,
  });
}

export function useScheduledNotes() {
  const { user } = useAuthStore();
  return useQuery<
    {
      id: string;
      title: string;
      content: string;
      scheduledAt: string;
      createdAt: string;
    }[]
  >({
    queryKey: ['stats', 'scheduled', user?.uid],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const res = await getScheduledNotes(user!.uid);
      return isOk(res) ? res.data : [];
    },
    enabled: !!user?.uid,
    staleTime: STALE,
  });
}

