export type MoodId =
  | 'happy'
  | 'calm'
  | 'focused'
  | 'sad'
  | 'anxious'
  | 'angry'
  | 'excited'
  | 'tired'
  | 'grateful'
  | 'neutral';

export interface MoodOption {
  id: MoodId;
  label: string;
  icon: string;
  color: string;
}
