// next.config.ts — konfigurasi Next.js 16
import type { NextConfig } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

// App version is read from package.json at build time and exposed as
// NEXT_PUBLIC_APP_VERSION — this is the ONLY source of truth for the
// version shown in Settings (src/app/(protected)/settings/page.tsx).
// Previously that string was hardcoded ("Versi 1.0.0") and never updated
// across multiple releases, so the UI kept showing 1.0.0 long after the
// actual deployed version had moved on. Bumping package.json's "version"
// field is now the only thing needed — the UI follows automatically on
// the next build/deploy.
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8')) as { version: string };

// ─── Security headers ───────────────────────────────────────────────────────

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  {
    key:   'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=()',
  },
  {
    key:   'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key:   'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' blob: data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://api.open-meteo.com",
      "frame-src 'self' https://accounts.google.com https://nala-koe.firebaseapp.com",
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

// ─── Config ────────────────────────────────────────────────────────────────

const config: NextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },

  // Next.js 16: eslint key removed — use CLI flag instead (no-op here, lint runs separately)
  typescript: { ignoreBuildErrors: false },

  // Next.js 16 Turbopack is enabled by default.
  // Empty turbopack config silences the webpack/turbopack mismatch error.
  turbopack: {},

  images: {
    formats:        ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      {
        source:  '/(.*)',
        headers: securityHeaders,
      },
      {
        source:  '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type',  value: 'application/javascript' },
        ],
      },
    ];
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['warn', 'error'] }
        : false,
  },

  // firebase-admin uses gRPC/protobufjs — keep server-side only
  serverExternalPackages: ['firebase-admin', '@google-cloud/firestore'],
};

export default config;
