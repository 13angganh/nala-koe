// ─── Session ────────────────────────────────────────────────────────────────
// Satu-satunya sumber kebenaran nama cookie. Dipakai di:
//   • middleware.ts
//   • app/api/auth/session/route.ts
//   • lib/api-auth.ts
export const SESSION_COOKIE_NAME       = 'nalakoe-session';
export const SESSION_DURATION_DAYS     = 7;
export const SESSION_DURATION_SECONDS  = SESSION_DURATION_DAYS * 24 * 60 * 60;

// ─── App ────────────────────────────────────────────────────────────────────
export const CONFIG = {
  APP_NAME: 'NalaKoe',
  APP_TAGLINE: 'Catatan pribadimu yang hidup dan bernapas',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  // Note limits
  MAX_NOTE_TITLE_LENGTH: 200,
  MAX_NOTE_CONTENT_LENGTH: 100_000,
  MAX_VERSION_HISTORY: 10,
  TRASH_RETENTION_DAYS: 30,

  // File limits
  MAX_IMAGE_SIZE_MB: 5,
  MAX_AUDIO_SIZE_MB: 10,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_AUDIO_SIZE_BYTES: 10 * 1024 * 1024,

  // Pagination
  NOTES_PER_PAGE: 20,

  // Time capsule
  MIN_TIME_CAPSULE_DAYS: 1,
  MAX_TIME_CAPSULE_YEARS: 10,

  // Streak
  STREAK_GRACE_PERIOD_HOURS: 2,

  // Reading time
  WORDS_PER_MINUTE: 200,
} as const;
