import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import type { Tag, TagCloudItem } from '@/types/tag.types';

const NOTES_COLLECTION = 'notes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeWeight(count: number, min: number, max: number): number {
  if (max === min) return 3; // Mid-weight when all equal
  return Math.round(1 + ((count - min) / (max - min)) * 4);
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Derive tags from a user's active notes.
 * Returns tags sorted by count descending.
 */
export async function getUserTags(userId: string): Promise<ApiResult<Tag[]>> {
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc'),
      limit(500)
    );
    const snap = await getDocs(q);

    const tagMap = new Map<string, { count: number; createdAt: string }>();

    snap.docs.forEach((d) => {
      const data = d.data();
      const tags = (data.tags as string[]) ?? [];
      const noteCreatedAt = (data.createdAt as string) ?? new Date().toISOString();

      tags.forEach((tag) => {
        const existing = tagMap.get(tag);
        if (existing) {
          existing.count += 1;
        } else {
          tagMap.set(tag, { count: 1, createdAt: noteCreatedAt });
        }
      });
    });

    const tags: Tag[] = Array.from(tagMap.entries()).map(
      ([name, { count, createdAt }]) => ({
        id: name,
        name,
        count,
        createdAt,
      })
    );

    tags.sort((a, b) => b.count - a.count);
    return ok(tags);
  } catch (error) {
    logger.error('tags.list.failed', { error, userId });
    return err('tags/list-failed', 'Gagal memuat daftar tag');
  }
}

/**
 * Build a weighted tag cloud for visual display.
 * Weights are normalized 1–5.
 */
export async function getTagCloud(
  userId: string
): Promise<ApiResult<TagCloudItem[]>> {
  const result = await getUserTags(userId);

  if (!result.data) {
    return err('tags/cloud-failed', 'Gagal memuat tag cloud');
  }

  const tags = result.data.slice(0, 50); // Cap at 50 for performance

  if (tags.length === 0) return ok([]);

  const min = tags[tags.length - 1]?.count ?? 0;
  const max = tags[0]?.count ?? 1;

  const cloud: TagCloudItem[] = tags.map((tag) => ({
    name: tag.name,
    count: tag.count,
    weight: normalizeWeight(tag.count, min, max),
  }));

  return ok(cloud);
}

/**
 * Get all unique tag names for a user (for autocomplete suggestions).
 */
export async function getTagSuggestions(
  userId: string,
  search: string
): Promise<ApiResult<string[]>> {
  const result = await getUserTags(userId);

  if (!result.data) {
    return err('tags/suggestions-failed', 'Gagal memuat saran tag');
  }

  const term = search.toLowerCase().trim();
  const suggestions = result.data
    .map((t) => t.name)
    .filter((name) => name.toLowerCase().includes(term))
    .slice(0, 10);

  return ok(suggestions);
}
