/**
 * lib/api-auth.ts — SERVER SIDE ONLY
 * Helper untuk verifikasi session cookie di setiap protected API route.
 * Import dan panggil verifySession() di baris pertama setiap handler API yang butuh auth.
 *
 * Contoh penggunaan:
 *   const claims = await verifySession(request);
 *   if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   const { uid } = claims;
 */
import { type NextRequest } from 'next/server';
import { adminAuth }        from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/constants/config';

/**
 * Verifikasi session cookie dari request.
 * Mengembalikan decoded claims jika valid, null jika tidak ada atau tidak valid.
 * checkRevoked: true — verifikasi token tidak dicabut (logout dari device lain).
 */
export async function verifySession(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    return await adminAuth.verifySessionCookie(cookie, true);
  } catch {
    return null;
  }
}
