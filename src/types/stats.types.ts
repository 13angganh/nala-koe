import type { MoodId } from './mood.types';

export interface WritingStats {
  totalNotes: number;
  totalWords: number;
  averageWordsPerNote: number;
  longestNote: { id: string; title: string; wordCount: number } | null;
  wordsThisWeek: number;
  notesThisWeek: number;
  mostProductiveHour: number | null; // 0–23
  currentStreak: number; // days
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface MoodInsight {
  mood: MoodId;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  year: number;
  month: number; // 1–12
  noteCount: number;
  wordCount: number;
  moodBreakdown: MoodInsight[];
  activeDays: number;
}

export interface WeeklyActivity {
  date: string; // ISO date string
  noteCount: number;
  wordCount: number;
}
