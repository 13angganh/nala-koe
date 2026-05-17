import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  photoURL: z.string().url('URL foto tidak valid').nullable().optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i, 'Warna tidak valid'),
  defaultView: z.enum(['grid', 'list']),
  enableWeather: z.boolean(),
  enableLocation: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
