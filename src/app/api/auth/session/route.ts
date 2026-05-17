import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { logger }    from '@/lib/logger';
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from '@/constants/config';

/**
 * POST /api/auth/session
 * Terima idToken dari Firebase Auth (client), verifikasi, buat session cookie httpOnly.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { idToken?: string };

    if (!body.idToken || typeof body.idToken !== 'string') {
      return NextResponse.json({ error: 'idToken wajib diisi' }, { status: 400 });
    }

    // Verify ID token sebelum buat session cookie
    await adminAuth.verifyIdToken(body.idToken);

    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_DURATION_SECONDS * 1000, // milliseconds
    });

    const response = NextResponse.json({ success: true });

    // Cookie wajib: httpOnly, secure (prod), sameSite lax
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   SESSION_DURATION_SECONDS,
      path:     '/',
    });

    return response;
  } catch (error) {
    logger.error('session/POST', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/session
 * Hapus session cookie saat logout.
 */
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0, // Expire immediately
    path:     '/',
  });
  return response;
}
