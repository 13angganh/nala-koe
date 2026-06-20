'use client';

import { memo } from 'react';
import { MapPin, CloudSun, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/tags/tag-input';
import { NoteMoodPicker } from './note-mood-picker';
import { NoteWeatherBadge } from './note-weather-badge';
import { NoteVisibilityToggle, NoteHiddenCollapsedRow } from './note-visibility-toggle';
import type { MoodId } from '@/types/mood.types';
import type { WeatherSnapshot } from '@/types/api.types';
import type { NoteLocation, NoteSectionKey } from '@/types/note.types';

interface NoteMetaPanelProps {
  mood: MoodId | null;
  onMoodChange: (mood: MoodId | null) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  tagSuggestions: string[];
  onTagSearchChange: (query: string) => void;
  weather: WeatherSnapshot | null;
  onWeatherChange: (weather: WeatherSnapshot | null) => void;
  location: NoteLocation | null;
  onLocationChange: (location: NoteLocation | null) => void;
  onRequestLocation: () => void;
  isRequestingLocation: boolean;
  isFetchingWeather: boolean;
  onFetchWeatherForLocation: () => void;
  language: string | null;
  hiddenSections: NoteSectionKey[];
  onToggleSection: (section: NoteSectionKey) => void;
}

/**
 * Mood / Tags / Weather / Location panel, extracted from NoteEditor to keep
 * that file within the project's ~200-line target and to isolate re-renders:
 * this panel only needs to re-render when its own slice of note data
 * changes, not on every keystroke in the title/content editor.
 *
 * Each sub-section (mood, tags, weather+location) carries its own
 * NoteVisibilityToggle so the user can hide it from the note's visible
 * layout — without clearing the underlying value — when the note is long
 * and they want a shorter view. A hidden section collapses to a single
 * dashed placeholder row.
 */
function NoteMetaPanelImpl({
  mood,
  onMoodChange,
  tags,
  onTagsChange,
  tagSuggestions,
  onTagSearchChange,
  weather,
  onWeatherChange,
  location,
  onLocationChange,
  onRequestLocation,
  isRequestingLocation,
  isFetchingWeather,
  onFetchWeatherForLocation,
  language,
  hiddenSections,
  onToggleSection,
}: NoteMetaPanelProps) {
  const isMoodHidden = hiddenSections.includes('mood');
  const isTagsHidden = hiddenSections.includes('tags');
  const isWeatherHidden = hiddenSections.includes('weather') || hiddenSections.includes('location');

  return (
    <section aria-label="Metadata catatan" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-4">
      {/* Mood */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Mood</p>
          <NoteVisibilityToggle isHidden={isMoodHidden} onToggle={() => onToggleSection('mood')} label="mood" />
        </div>
        {isMoodHidden ? (
          <NoteHiddenCollapsedRow label="Mood" onToggle={() => onToggleSection('mood')} />
        ) : (
          <NoteMoodPicker value={mood} onChange={onMoodChange} />
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Tag</p>
          <NoteVisibilityToggle isHidden={isTagsHidden} onToggle={() => onToggleSection('tags')} label="tag" />
        </div>
        {isTagsHidden ? (
          <NoteHiddenCollapsedRow label="Tag" onToggle={() => onToggleSection('tags')} />
        ) : (
          <TagInput value={tags} onChange={onTagsChange} suggestions={tagSuggestions} onSearchChange={onTagSearchChange} />
        )}
      </div>

      {/* Weather + Location */}
      <div className="space-y-2">
        {(weather || location) && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Cuaca &amp; Lokasi</p>
            <NoteVisibilityToggle isHidden={isWeatherHidden} onToggle={() => onToggleSection('weather')} label="cuaca dan lokasi" />
          </div>
        )}
        {isWeatherHidden && (weather || location) ? (
          <NoteHiddenCollapsedRow label="Cuaca & lokasi" onToggle={() => onToggleSection('weather')} />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {location ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-base)] px-2.5 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] max-w-[160px] truncate">
                  {location.placeName ?? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`}
                </span>
                <button type="button" onClick={() => { onLocationChange(null); onWeatherChange(null); }} aria-label="Hapus lokasi" className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={onRequestLocation} disabled={isRequestingLocation || isFetchingWeather} className="h-7 text-xs gap-1.5">
                {isRequestingLocation || isFetchingWeather ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                {isRequestingLocation ? 'Mencari lokasi…' : isFetchingWeather ? 'Mengambil cuaca…' : 'Tambah lokasi'}
              </Button>
            )}
            {weather && (
              <div className="flex items-center gap-1.5">
                <NoteWeatherBadge weather={weather} compact />
                <button type="button" onClick={() => onWeatherChange(null)} aria-label="Hapus cuaca" className="text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {!weather && location && (
              <Button variant="ghost" size="sm" onClick={onFetchWeatherForLocation} disabled={isFetchingWeather} className="h-7 text-xs gap-1.5">
                {isFetchingWeather ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudSun className="h-3.5 w-3.5" />}
                Tambah cuaca
              </Button>
            )}
          </div>
        )}
      </div>

      {language && (
        <p className="text-xs text-[var(--text-tertiary)]">
          Bahasa terdeteksi: <span className="font-medium">{language.toUpperCase()}</span>
        </p>
      )}
    </section>
  );
}

export const NoteMetaPanel = memo(NoteMetaPanelImpl);
