import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err, normalizeDocument } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import type {
  WritingStats,
  MoodInsight,
  MonthlyStats,
  WeeklyActivity,
} from '@/types/stats.types';
import type { MoodId } from '@/types/mood.types';

const COLLECTION = 'notes';

interface RawNoteData {
  createdAt: string;
  wordCount: number;
  mood: MoodId | null;
  status: string;
  title: string;
  id: string;
}

function toDateStr(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function computeStreak(sortedDates: string[]): { current: number; longest: number } {
  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let run = 1;
  let longest = 0;

  for (let i = sortedDates.length - 1; i > 0; i--) {
    const a = sortedDates[i];
    const b = sortedDates[i - 1];
    if (!a || !b) continue;
    const diff = Math.round(
      (new Date(a).getTime() - new Date(b).getTime()) /
        86400000
    );
    if (diff === 1) run++;
    else { longest = Math.max(longest, run); run = 1; }
  }
  longest = Math.max(longest, run);

  const last = sortedDates[sortedDates.length - 1];
  let current = 0;
  if (last === todayStr || last === yesterdayStr) {
    let streak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const a = sortedDates[i];
      const b = sortedDates[i - 1];
      if (!a || !b) break;
      const diff = Math.round(
        (new Date(a).getTime() - new Date(b).getTime()) /
          86400000
      );
      if (diff === 1) streak++;
      else break;
    }
    current = streak;
  }

  return { current, longest };
}

/** Fetch all active notes and compute writing stats */
export async function getWritingStats(userId: string): Promise<ApiResult<WritingStats>> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);

    const notes: RawNoteData[] = snap.docs.map((d) => {
      const data = normalizeDocument(d.data());
      return {
        id: d.id,
        createdAt: (data.createdAt as string) ?? new Date().toISOString(),
        wordCount: (data.wordCount as number) ?? 0,
        mood: (data.mood as MoodId | null) ?? null,
        status: (data.status as string) ?? 'active',
        title: (data.title as string) ?? '',
      };
    });

    if (notes.length === 0) {
      return ok({
        totalNotes: 0,
        totalWords: 0,
        averageWordsPerNote: 0,
        longestNote: null,
        wordsThisWeek: 0,
        notesThisWeek: 0,
        mostProductiveHour: null,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      });
    }

    const totalNotes = notes.length;
    const totalWords = notes.reduce((s, n) => s + n.wordCount, 0);
    const averageWordsPerNote = Math.round(totalWords / totalNotes);

    const longestNoteRaw = notes.reduce((a, b) => (a.wordCount >= b.wordCount ? a : b));
    const longestNote = {
      id: longestNoteRaw.id,
      title: longestNoteRaw.title,
      wordCount: longestNoteRaw.wordCount,
    };

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const thisWeekNotes = notes.filter((n) => n.createdAt >= weekAgo);
    const wordsThisWeek = thisWeekNotes.reduce((s, n) => s + n.wordCount, 0);
    const notesThisWeek = thisWeekNotes.length;

    // Most productive hour (0–23)
    const hourCounts: Record<number, number> = {};
    for (const n of notes) {
      const h = new Date(n.createdAt).getHours();
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    }
    const mostProductiveHour = Object.entries(hourCounts).reduce(
      (best, [h, c]) => (c > (hourCounts[best] ?? 0) ? Number(h) : best),
      0
    );

    // Streak
    const dateSet = new Set(notes.map((n) => toDateStr(n.createdAt)));
    const sortedDates = Array.from(dateSet).sort();
    const { current, longest } = computeStreak(sortedDates);
    const lastActiveDate = sortedDates[sortedDates.length - 1] ?? null;

    return ok({
      totalNotes,
      totalWords,
      averageWordsPerNote,
      longestNote,
      wordsThisWeek,
      notesThisWeek,
      mostProductiveHour: Object.keys(hourCounts).length > 0 ? mostProductiveHour : null,
      currentStreak: current,
      longestStreak: longest,
      lastActiveDate,
    });
  } catch (error) {
    logger.error('stats.writing.failed', { error });
    return err('stats/writing-failed', 'Gagal memuat statistik menulis');
  }
}

/** Mood breakdown over all active notes */
export async function getMoodInsights(userId: string): Promise<ApiResult<MoodInsight[]>> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);

    const moodCounts: Partial<Record<MoodId, number>> = {};
    let withMood = 0;

    for (const d of snap.docs) {
      const data = normalizeDocument(d.data());
      const mood = data.mood as MoodId | null;
      if (mood) {
        moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
        withMood++;
      }
    }

    if (withMood === 0) return ok([]);

    const insights: MoodInsight[] = Object.entries(moodCounts).map(([mood, count]) => ({
      mood: mood as MoodId,
      count: count ?? 0,
      percentage: Math.round(((count ?? 0) / withMood) * 100),
    }));

    insights.sort((a, b) => b.count - a.count);
    return ok(insights);
  } catch (error) {
    logger.error('stats.mood.failed', { error });
    return err('stats/mood-failed', 'Gagal memuat insight mood');
  }
}

/** Monthly stats for last N months */
export async function getMonthlyStats(
  userId: string,
  months = 6
): Promise<ApiResult<MonthlyStats[]>> {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      where('createdAt', '>=', cutoff.toISOString()),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);

    const buckets: Record<string, MonthlyStats> = {};

    for (const d of snap.docs) {
      const data = normalizeDocument(d.data());
      const iso = data.createdAt as string;
      if (!iso) continue;
      const date = new Date(iso);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      const key = `${year}-${month}`;
      const wc = (data.wordCount as number) ?? 0;
      const mood = data.mood as MoodId | null;
      const dayStr = toDateStr(iso);

      if (!buckets[key]) {
        buckets[key] = {
          year,
          month,
          noteCount: 0,
          wordCount: 0,
          moodBreakdown: [],
          activeDays: 0,
        };
      }

      const bucket = buckets[key];
      bucket.noteCount++;
      bucket.wordCount += wc;

      if (mood) {
        const existing = bucket.moodBreakdown.find((m) => m.mood === mood);
        if (existing) existing.count++;
        else bucket.moodBreakdown.push({ mood, count: 1, percentage: 0 });
      }

      // Count unique active days (rough — using a set stored per key)
      // We'll track via a temporary Set on a side channel
      (bucket as { _days?: Set<string> })._days =
        (bucket as { _days?: Set<string> })._days ?? new Set();
      (bucket as { _days?: Set<string> })._days?.add(dayStr);
    }

    // Finalize
    const results: MonthlyStats[] = Object.values(buckets).map((b) => {
      const totalWithMood = b.moodBreakdown.reduce((s, m) => s + m.count, 0);
      const moodBreakdown = b.moodBreakdown
        .map((m) => ({
          ...m,
          percentage: totalWithMood > 0 ? Math.round((m.count / totalWithMood) * 100) : 0,
        }))
        .sort((a, c) => c.count - a.count);

      const activeDays = (b as { _days?: Set<string> })._days?.size ?? 0;
      const { _days: _removed, ...clean } = b as MonthlyStats & { _days?: Set<string> };
      void _removed;

      return { ...clean, moodBreakdown, activeDays };
    });

    results.sort((a, b) => a.year - b.year || a.month - b.month);
    return ok(results);
  } catch (error) {
    logger.error('stats.monthly.failed', { error });
    return err('stats/monthly-failed', 'Gagal memuat statistik bulanan');
  }
}

/** Daily activity for last N days */
export async function getWeeklyActivity(
  userId: string,
  days = 30
): Promise<ApiResult<WeeklyActivity[]>> {
  try {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();

    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      where('createdAt', '>=', cutoff),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);

    const map: Record<string, WeeklyActivity> = {};

    for (const d of snap.docs) {
      const data = normalizeDocument(d.data());
      const iso = data.createdAt as string;
      if (!iso) continue;
      const dateStr = toDateStr(iso);
      if (!map[dateStr]) map[dateStr] = { date: dateStr, noteCount: 0, wordCount: 0 };
      map[dateStr].noteCount++;
      map[dateStr].wordCount += (data.wordCount as number) ?? 0;
    }

    const result = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    return ok(result);
  } catch (error) {
    logger.error('stats.weekly.failed', { error });
    return err('stats/weekly-failed', 'Gagal memuat aktivitas mingguan');
  }
}

/** Tag frequency for tag cloud */
export async function getTagFrequency(
  userId: string
): Promise<ApiResult<{ tag: string; count: number }[]>> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);

    const freq: Record<string, number> = {};
    for (const d of snap.docs) {
      const data = normalizeDocument(d.data());
      const tags = (data.tags as string[]) ?? [];
      for (const t of tags) {
        freq[t] = (freq[t] ?? 0) + 1;
      }
    }

    const result = Object.entries(freq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return ok(result);
  } catch (error) {
    logger.error('stats.tags.failed', { error });
    return err('stats/tags-failed', 'Gagal memuat frekuensi tag');
  }
}

/** Get all scheduled notes for a user */
export async function getScheduledNotes(userId: string): Promise<
  ApiResult<
    {
      id: string;
      title: string;
      content: string;
      scheduledAt: string;
      createdAt: string;
    }[]
  >
> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('isScheduled', '==', true),
      where('status', '==', 'active'),
      orderBy('scheduledAt', 'asc')
    );
    const snap = await getDocs(q);

    const notes = snap.docs
      .map((d) => {
        const data = normalizeDocument(d.data());
        return {
          id: d.id,
          title: (data.title as string) ?? '',
          content: (data.content as string) ?? '',
          scheduledAt: (data.scheduledAt as string) ?? '',
          createdAt: (data.createdAt as string) ?? '',
        };
      })
      .filter((n) => n.scheduledAt); // only those with a scheduled date

    return ok(notes);
  } catch (error) {
    logger.error('stats.scheduled.failed', { error });
    return err('stats/scheduled-failed', 'Gagal memuat catatan terjadwal');
  }
}
