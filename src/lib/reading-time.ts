import { CONFIG } from '@/constants/config';
import { stripHtml } from './utils';

/** Count words in a string */
export function countWords(text: string): number {
  const clean = stripHtml(text).trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

/** Estimate reading time in minutes (minimum 1) */
export function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / CONFIG.WORDS_PER_MINUTE));
}

/** Count words and return both count and reading time */
export function analyzeContent(content: string): { wordCount: number; readingTimeMinutes: number } {
  const wordCount = countWords(content);
  return { wordCount, readingTimeMinutes: estimateReadingTime(wordCount) };
}
