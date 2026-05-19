import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import type { MoodId } from '@/types/mood.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MoodStat {
  mood: MoodId;
  count: number;
}

export interface MoodMonthlyInsight {
  month: string; // YYYY-MM
  stats: MoodStat[];
  dominantMood: MoodId | null;
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Get mood statistics for a user's notes within a date range.
 * Groups by mood and returns count per mood.
 */
export async function getMoodStats(
  userId: string,
  from?: Date,
  to?: Date
): Promise<ApiResult<MoodStat[]>> {
  try {
    const constraints = [
      where('userId', '==', userId),
      where('status', '==', 'active'),
      where('mood', '!=', null),
    ];

    if (from) {
      constraints.push(where('createdAt', '>=', from.toISOString()));
    }
    if (to) {
      constraints.push(where('createdAt', '<=', to.toISOString()));
    }

    const q = query(collection(db, 'notes'), ...constraints);
    const snap = await getDocs(q);

    const counts = new Map<MoodId, number>();

    snap.docs.forEach((d) => {
      const mood = d.data().mood as MoodId | null;
      if (mood) {
        counts.set(mood, (counts.get(mood) ?? 0) + 1);
      }
    });

    const stats: MoodStat[] = Array.from(counts.entries()).map(
      ([mood, count]) => ({ mood, count })
    );

    stats.sort((a, b) => b.count - a.count);

    return ok(stats);
  } catch (error) {
    logger.error('mood.stats.failed', { error, userId });
    return err('mood/stats-failed', 'Gagal memuat statistik mood');
  }
}

/**
 * Get monthly mood insight for the current month.
 */
export async function getMoodMonthlyInsight(
  userId: string
): Promise<ApiResult<MoodMonthlyInsight>> {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const result = await getMoodStats(userId, from, to);

  if (!result.data) {
    return err('mood/insight-failed', 'Gagal memuat insight mood bulanan');
  }

  const dominantMood = result.data[0]?.mood ?? null;

  return ok({ month, stats: result.data, dominantMood });
}
