import type { ApiResult, ApiResponse, ApiError } from '@/types/api.types';

/** Wrap a successful value into the standard ApiResponse shape */
export function ok<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

/** Wrap an error into the standard ApiError shape */
export function err(code: string, message: string, details?: unknown): ApiError {
  return { data: null, error: { code, message, details } };
}

/** Type guard: check if an ApiResult is a success */
export function isOk<T>(result: ApiResult<T>): result is ApiResponse<T> {
  return result.error === null;
}

/** Normalize Firestore timestamps to ISO strings */
export function normalizeTimestamp(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  // Firestore Timestamp
  if (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

/** Normalize a Firestore document to ensure all timestamps are ISO strings */
export function normalizeDocument<T extends Record<string, unknown>>(doc: T): T {
  const timestampFields = [
    'createdAt',
    'updatedAt',
    'trashedAt',
    'archivedAt',
    'fetchedAt',
    'timeCapsuleUnlockAt',
    'scheduledAt',
    'originalCreatedAt',
  ];

  const result = { ...doc };
  for (const field of timestampFields) {
    if (field in result && result[field] !== null && result[field] !== undefined) {
      result[field] = normalizeTimestamp(result[field]) as T[typeof field];
    }
  }
  return result;
}
