'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UrlMeta {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

interface UseUrlMetaReturn {
  meta: UrlMeta | null;
  isFetching: boolean;
  error: string | null;
  fetchMeta: (url: string) => Promise<UrlMeta | null>;
  reset: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUrlMeta(): UseUrlMetaReturn {
  const [meta, setMeta] = useState<UrlMeta | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = useCallback(async (url: string): Promise<UrlMeta | null> => {
    if (!isValidUrl(url)) {
      setError('URL tidak valid');
      return null;
    }

    setIsFetching(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/url-meta?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(10_000) }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json() as UrlMeta;
      setMeta(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengambil metadata URL';
      logger.warn('useUrlMeta: fetch failed', { url, error: msg });
      setError('Gagal mengambil preview. Pastikan URL dapat diakses.');
      return null;
    } finally {
      setIsFetching(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMeta(null);
    setError(null);
  }, []);

  return { meta, isFetching, error, fetchMeta, reset };
}
