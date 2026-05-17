'use client';

import { useState, useCallback } from 'react';
import type { WeatherSnapshot } from '@/types/api.types';
import { logger } from '@/lib/logger';

// ─── WMO weather code descriptions ───────────────────────────────────────────

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Cerah',
  1: 'Sebagian cerah',
  2: 'Berawan sebagian',
  3: 'Mendung',
  45: 'Berkabut',
  48: 'Kabut beku',
  51: 'Gerimis ringan',
  53: 'Gerimis sedang',
  55: 'Gerimis lebat',
  61: 'Hujan ringan',
  63: 'Hujan sedang',
  65: 'Hujan lebat',
  71: 'Salju ringan',
  73: 'Salju sedang',
  75: 'Salju lebat',
  80: 'Hujan lokal ringan',
  81: 'Hujan lokal sedang',
  82: 'Hujan lokal lebat',
  95: 'Badai petir',
  96: 'Badai petir dengan hujan es',
  99: 'Badai petir lebat',
};

function getWmoDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? 'Tidak diketahui';
}

// ─── Open-Meteo response types ────────────────────────────────────────────────

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type WeatherStatus = 'idle' | 'fetching' | 'success' | 'error' | 'unavailable';

interface UseWeatherReturn {
  weather: WeatherSnapshot | null;
  status: WeatherStatus;
  isFetching: boolean;
  fetchWeather: (lat: number, lon: number) => Promise<WeatherSnapshot | null>;
  clearWeather: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');

  const fetchWeather = useCallback(
    async (lat: number, lon: number): Promise<WeatherSnapshot | null> => {
      setStatus('fetching');
      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', String(lat));
        url.searchParams.set('longitude', String(lon));
        url.searchParams.set(
          'current',
          'temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m'
        );
        url.searchParams.set('timezone', 'auto');
        url.searchParams.set('forecast_days', '1');

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

        const data = (await res.json()) as OpenMeteoResponse;
        const cur = data.current;

        const snapshot: WeatherSnapshot = {
          temperature: Math.round(cur.temperature_2m),
          weatherCode: cur.weather_code,
          description: getWmoDescription(cur.weather_code),
          isDay: cur.is_day === 1,
          humidity: cur.relative_humidity_2m,
          windSpeed: Math.round(cur.wind_speed_10m),
          fetchedAt: new Date().toISOString(),
        };

        setWeather(snapshot);
        setStatus('success');
        return snapshot;
      } catch (error) {
        logger.error('weather.fetch.failed', { error, lat, lon });
        setStatus('error');
        return null;
      }
    },
    []
  );

  const clearWeather = useCallback(() => {
    setWeather(null);
    setStatus('idle');
  }, []);

  return {
    weather,
    status,
    isFetching: status === 'fetching',
    fetchWeather,
    clearWeather,
  };
}
