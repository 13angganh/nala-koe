'use client';

import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning,
  Wind, Droplets, Thermometer, CloudDrizzle, CloudFog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRelativeTime } from '@/lib/format';
import type { WeatherSnapshot } from '@/types/api.types';

// ─── WMO icon mapping ─────────────────────────────────────────────────────────

function getWeatherIcon(code: number, isDay: boolean): React.ElementType {
  if (code === 0) return isDay ? Sun : Cloud;
  if (code <= 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 55) return CloudDrizzle;
  if (code <= 65) return CloudRain;
  if (code <= 75) return CloudSnow;
  if (code <= 82) return CloudRain;
  return CloudLightning;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NoteWeatherBadgeProps {
  weather: WeatherSnapshot;
  compact?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteWeatherBadge({
  weather,
  compact = false,
  className,
}: NoteWeatherBadgeProps) {
  const Icon = getWeatherIcon(weather.weatherCode, weather.isDay);

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <p className="font-medium">{weather.description}</p>
      <div className="flex items-center gap-3 text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          {weather.temperature}°C
        </span>
        <span className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          {weather.windSpeed} km/h
        </span>
      </div>
      <p className="text-[var(--text-tertiary)]">
        Saat catatan dibuat · {formatRelativeTime(weather.fetchedAt)}
      </p>
    </div>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]',
              'cursor-default select-none',
              className
            )}
            aria-label={`Cuaca: ${weather.description}, ${weather.temperature}°C`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            {weather.temperature}°C
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipContent}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5',
            'border border-[var(--border)] bg-[var(--surface-subtle)]',
            'cursor-default select-none',
            className
          )}
          aria-label={`Cuaca saat catatan dibuat: ${weather.description}, ${weather.temperature}°C`}
        >
          <Icon className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-[var(--text-primary)] leading-tight">
              {weather.temperature}°C · {weather.description}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] leading-tight">
              {weather.humidity}% lembap · Angin {weather.windSpeed} km/h
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
