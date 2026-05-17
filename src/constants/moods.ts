import type { MoodOption } from '@/types/mood.types';

export const MOODS: MoodOption[] = [
  { id: 'happy', label: 'Senang', icon: 'smile', color: '#fbbf24' },
  { id: 'calm', label: 'Tenang', icon: 'cloud', color: '#60a5fa' },
  { id: 'focused', label: 'Fokus', icon: 'zap', color: '#0ea5e9' },
  { id: 'sad', label: 'Sedih', icon: 'cloud-rain', color: '#94a3b8' },
  { id: 'anxious', label: 'Cemas', icon: 'alert-circle', color: '#f87171' },
  { id: 'angry', label: 'Marah', icon: 'flame', color: '#ef4444' },
  { id: 'excited', label: 'Semangat', icon: 'sparkles', color: '#f59e0b' },
  { id: 'tired', label: 'Lelah', icon: 'moon', color: '#8b5cf6' },
  { id: 'grateful', label: 'Bersyukur', icon: 'heart', color: '#ec4899' },
  { id: 'neutral', label: 'Biasa', icon: 'minus-circle', color: '#64748b' },
] as const;

export const MOOD_MAP = Object.fromEntries(
  MOODS.map((mood) => [mood.id, mood])
) as Record<string, MoodOption>;
