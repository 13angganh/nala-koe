import { z } from 'zod';
import { CONFIG } from '@/constants/config';

export const createNoteSchema = z.object({
  title: z
    .string()
    .max(CONFIG.MAX_NOTE_TITLE_LENGTH, `Judul maksimal ${CONFIG.MAX_NOTE_TITLE_LENGTH} karakter`)
    .optional()
    .default(''),
  content: z
    .string()
    .max(
      CONFIG.MAX_NOTE_CONTENT_LENGTH,
      `Konten maksimal ${CONFIG.MAX_NOTE_CONTENT_LENGTH} karakter`
    )
    .optional()
    .default(''),
  mood: z
    .enum(['happy', 'calm', 'focused', 'sad', 'anxious', 'angry', 'excited', 'tired', 'grateful', 'neutral'])
    .nullable()
    .optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maksimal 20 tag').default([]),
  isPinned: z.boolean().default(false),
  isSecret: z.boolean().default(false),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteFiltersSchema = z.object({
  status: z.enum(['active', 'archived', 'trashed']).optional(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sort: z.enum(['updatedAt', 'createdAt', 'title', 'wordCount']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

export type CreateNoteFormInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteFormInput = z.infer<typeof updateNoteSchema>;
export type NoteFiltersInput = z.infer<typeof noteFiltersSchema>;
