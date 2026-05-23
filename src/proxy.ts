import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/constants/config';

// Route yang bisa diakses tanpa login
const PUBLIC_PATHS = ['/', '/login', '/register', '/offline'];
// Route khusus auth (redirect ke dashboard jika sudah login)
const AUTH_PATHS   = ['/login', '/register'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip: API routes, static assets, SW, manifest
  if (
    pathname.startsWith('/_next')   ||
    pathname.startsWith('/api')     ||
    pathname.startsWith('/icons')   ||
    pathname === '/manifest.json'   ||
    pathname === '/sw.js'           ||
    pathname === '/favicon.ico'     ||
    pathname === '/favicon.svg'
  ) {
    return NextResponse.next();
  }

  const session         = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(session);

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Protected tanpa session → redirect ke login dengan ?from= untuk redirect balik setelah login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth route dengan session aktif → redirect ke dashboard
  if (isAuthenticated && isAuthPath) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip: static files, Next.js internals, SW, manifest
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.json).*)'],
};
