import { z } from 'zod';

export const tagNameSchema = z
  .string()
  .min(1, 'Tag tidak boleh kosong')
  .max(30, 'Tag maksimal 30 karakter')
  .regex(/^[a-z0-9\-_]+$/, 'Tag hanya boleh huruf kecil, angka, - dan _');

export const tagsArraySchema = z
  .array(tagNameSchema)
  .max(10, 'Maksimal 10 tag per catatan');
