'use client';

import { useState, useCallback } from 'react';
import type { NoteLocation } from '@/types/note.types';
import { logger } from '@/lib/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface UseGeolocationReturn {
  location: NoteLocation | null;
  status: GeoStatus;
  isRequesting: boolean;
  requestLocation: () => Promise<NoteLocation | null>;
  clearLocation: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<NoteLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');

  const requestLocation = useCallback(async (): Promise<NoteLocation | null> => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return null;
    }

    setStatus('requesting');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          let placeName: string | null = null;

          // Reverse geocode via free API
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`
            );
            if (res.ok) {
              const data = (await res.json()) as {
                address?: {
                  city?: string;
                  town?: string;
                  village?: string;
                  county?: string;
                  state?: string;
                };
              };
              const addr = data.address;
              if (addr) {
                placeName =
                  addr.city ??
                  addr.town ??
                  addr.village ??
                  addr.county ??
                  addr.state ??
                  null;
              }
            }
          } catch (error) {
            logger.warn('geolocation.reverse.failed', { error });
          }

          const loc: NoteLocation = { latitude, longitude, placeName };
          setLocation(loc);
          setStatus('granted');
          resolve(loc);
        },
        (error) => {
          logger.warn('geolocation.denied', { code: error.code });
          setStatus(error.code === 1 ? 'denied' : 'unavailable');
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300_000, // 5 minutes cache
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
  }, []);

  return {
    location,
    status,
    isRequesting: status === 'requesting',
    requestLocation,
    clearLocation,
  };
}
