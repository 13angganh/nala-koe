import { z } from 'zod';

const envSchema = z.object({
  // Firebase Client SDK
  NEXT_PUBLIC_FIREBASE_API_KEY:             z.string().min(1, 'Firebase API key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:         z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:          z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID:              z.string().min(1),
  // NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET dihapus — Storage tidak dipakai (plan Blaze)

  // Firebase Realtime Database — opsional, hanya wajib jika fitur RTDB diaktifkan
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Firebase Admin SDK (server-side only — jangan expose ke client)
  FIREBASE_ADMIN_PROJECT_ID:   z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY:  z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    console.error('❌ Invalid environment variables:', JSON.stringify(formatted, null, 2));
    throw new Error('Invalid environment variables. Check the console for details.');
  }

  return parsed.data;
}

let _env: Env | null = null;

function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
