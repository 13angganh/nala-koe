'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeDocument } from '@/lib/normalizer';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  todayHasNote: boolean;
  activeDates: string[]; // ISO date strings (YYYY-MM-DD)
  milestoneReached: number | null; // The milestone count just reached (3, 7, 14, 30, 50, 100)
}

const MILESTONES = [3, 7, 14, 30, 50, 100] as const;

function toDateStr(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function computeStreak(sortedDates: string[]): {
  current: number;
  longest: number;
} {
  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = 0;
  let longest = 0;
  let run = 1;

  // Walk backwards through sorted unique dates
  for (let i = sortedDates.length - 1; i > 0; i--) {
    const aStr = sortedDates[i];
    const bStr = sortedDates[i - 1];
    if (!aStr || !bStr) continue;
    const a = new Date(aStr);
    const b = new Date(bStr);
    const diffDays = Math.round((a.getTime() - b.getTime()) / 86400000);
    if (diffDays === 1) {
      run++;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  // Current streak: must touch today or yesterday
  const last = sortedDates[sortedDates.length - 1];
  if (last === todayStr || last === yesterdayStr) {
    let streak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const aStr = sortedDates[i];
      const bStr = sortedDates[i - 1];
      if (!aStr || !bStr) break;
      const a = new Date(aStr);
      const b = new Date(bStr);
      if (Math.round((a.getTime() - b.getTime()) / 86400000) === 1) {
        streak++;
      } else {
        break;
      }
    }
    current = streak;
  }

  return { current, longest };
}

export function useStreak() {
  const { user } = useAuthStore();

  return useQuery<StreakInfo>({
    queryKey: ['streak', user?.uid],
    queryFn: async () => {
      const q = query(
        collection(db, 'notes'),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
        where('userId', '==', user!.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);

      const dateSet = new Set<string>();
      for (const d of snap.docs) {
        const data = normalizeDocument(d.data());
        if (data.createdAt) dateSet.add(toDateStr(data.createdAt as string));
      }

      const sortedDates = Array.from(dateSet).sort();
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayHasNote = dateSet.has(todayStr);

      const { current, longest } = computeStreak(sortedDates);

      // Determine if a milestone was just reached this session
      let milestoneReached: number | null = null;
      for (const m of MILESTONES) {
        if (current === m) {
          milestoneReached = m;
          break;
        }
      }

      return {
        currentStreak: current,
        longestStreak: longest,
        totalActiveDays: dateSet.size,
        todayHasNote,
        activeDates: sortedDates,
        milestoneReached,
      };
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60_000,
  });
}
