'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  getUserTags,
  getTagCloud,
  getTagSuggestions,
} from '@/services/tags.service';
import type { Tag, TagCloudItem } from '@/types/tag.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseTagsReturn {
  tags: Tag[];
  tagCloud: TagCloudItem[];
  suggestions: string[];
  isLoading: boolean;
  fetchTags: () => Promise<void>;
  fetchTagCloud: () => Promise<void>;
  searchSuggestions: (query: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTags(): UseTagsReturn {
  const user = useAuthStore((s) => s.user);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagCloud, setTagCloud] = useState<TagCloudItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTags = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const result = await getUserTags(user.uid);
      if (result.data) setTags(result.data);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const fetchTagCloud = useCallback(async () => {
    if (!user?.uid) return;
    const result = await getTagCloud(user.uid);
    if (result.data) setTagCloud(result.data);
  }, [user?.uid]);

  const searchSuggestions = useCallback(
    async (query: string) => {
      if (!user?.uid) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        if (!user?.uid) return;
        const result = await getTagSuggestions(user.uid, query);
        if (result.data) setSuggestions(result.data);
      }, 200);
    },
    [user?.uid]
  );

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    tags,
    tagCloud,
    suggestions,
    isLoading,
    fetchTags,
    fetchTagCloud,
    searchSuggestions,
  };
}
