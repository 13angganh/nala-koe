import { z } from 'zod';

// Firebase client config dan Admin SDK sudah hardcoded di firebase.ts dan firebase-admin.ts
// Env vars hanya digunakan untuk NEXT_PUBLIC_APP_URL
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://nala-koe.vercel.app'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Fallback — jangan crash jika tidak ada env var
    return { NEXT_PUBLIC_APP_URL: 'https://nala-koe.vercel.app' };
  }
  return parsed.data;
}

let _env: Env | null = null;

function getEnv(): Env {
  if (!_env) _env = validateEnv();
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
