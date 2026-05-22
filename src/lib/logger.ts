/**
 * lib/logger.ts — Structured logging ke console + Firestore error_logs.
 *
 * Level error dan warn di-persist ke Firestore collection 'error_logs'
 * sehingga error production bisa dipantau dari Firebase Console.
 * Level info hanya tampil di console (development only).
 *
 * Sentry tidak diintegrasikan — memerlukan langganan berbayar dan
 * memperlambat build Vercel.
 *
 * Signature yang didukung (backward compatible):
 *   logger.error('context', error)
 *   logger.error('context', { error, ...extra })
 *   logger.info('context', { key: value })
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level:     LogLevel;
  context:   string;
  message:   string;
  stack?:    string;
  timestamp: ReturnType<typeof serverTimestamp>;
  userAgent: string;
  url:       string;
}

// ─── Console formatting ────────────────────────────────────────────────────

const COLORS: Record<LogLevel, string> = {
  info:  '\x1b[36m', // cyan
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

function formatPrefix(level: LogLevel, context: string): string {
  const ts = new Date().toISOString();
  return `${COLORS[level]}[${ts}] [${level.toUpperCase()}] [${context}]${RESET}`;
}

// ─── Extract error info dari payload apapun ────────────────────────────────

function extractErrorInfo(payload: unknown): { message: string; stack?: string } {
  if (payload instanceof Error) {
    return {
      message: payload.message,
      ...(payload.stack !== undefined ? { stack: payload.stack } : {}),
    };
  }
  // Handle { error: Error, ...extra } pattern dari services
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'error' in payload &&
    (payload as Record<string, unknown>)['error'] instanceof Error
  ) {
    const err = (payload as Record<string, unknown>)['error'] as Error;
    return {
      message: err.message,
      ...(err.stack !== undefined ? { stack: err.stack } : {}),
    };
  }
  return { message: String(payload ?? '') };
}

// ─── Firestore persist (browser only) ─────────────────────────────────────

async function persistToFirestore(
  level: Exclude<LogLevel, 'info'>,
  context: string,
  payload: unknown
): Promise<void> {
  // Guard: tidak berjalan di SSR
  if (typeof window === 'undefined') return;

  try {
    const { message, stack } = extractErrorInfo(payload);

    const entry: LogEntry = {
      level,
      context,
      message,
      ...(stack !== undefined ? { stack } : {}),
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url:       window.location.href,
    };

    await addDoc(collection(db, 'error_logs'), entry);
  } catch {
    // Silent fail — jangan throw dari logger agar tidak menyebabkan infinite loop
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export const logger = {
  /**
   * info — hanya tampil di console development, tidak di-persist ke Firestore.
   */
  info(context: string, data?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(formatPrefix('info', context), data ?? '');
    }
  },

  /**
   * warn — tampil di console + di-persist ke Firestore error_logs.
   */
  warn(context: string, payload?: unknown): void {
    console.warn(formatPrefix('warn', context), payload ?? '');
    void persistToFirestore('warn', context, payload);
  },

  /**
   * error — tampil di console + di-persist ke Firestore error_logs.
   */
  error(context: string, payload?: unknown): void {
    console.error(formatPrefix('error', context), payload ?? '');
    void persistToFirestore('error', context, payload);
  },
};
