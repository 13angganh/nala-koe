import { z } from 'zod';

// Firebase client config (public by design — see firebase.ts) stays as-is.
// Firebase Admin SDK credentials moved to env vars in v1.2.4 after the
// private key was found hardcoded in firebase-admin.ts with this repo
// public on GitHub — see README.md changelog for the full incident.
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://nala-koe.vercel.app'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Unlike the old NEXT_PUBLIC_APP_URL-only schema, we do NOT silently
    // fall back here: FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY
    // missing or malformed means the Admin SDK cannot initialize at all —
    // every server-side Firestore/Auth call would fail. Failing loudly at
    // startup with a clear message is much easier to diagnose than a
    // confusing runtime crash the first time /api/auth/session is hit.
    throw new Error(
      `Konfigurasi environment variable tidak valid: ${parsed.error.issues
        .map((i) => `${i.path.join('.')} — ${i.message}`)
        .join('; ')}. Pastikan FIREBASE_ADMIN_CLIENT_EMAIL dan FIREBASE_ADMIN_PRIVATE_KEY sudah diset di Vercel → Settings → Environment Variables.`
    );
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

/**
 * PEM private keys contain literal newlines. Environment variable UIs
 * (Vercel dashboard, .env files) are single-line text — the key must be
 * pasted with newlines escaped as the two characters `\n`, and this
 * function converts them back to real newlines before firebase-admin's
 * cert() receives it. Without this, cert() fails to parse the key.
 */
export function getFirebaseAdminPrivateKey(): string {
  return env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
}
