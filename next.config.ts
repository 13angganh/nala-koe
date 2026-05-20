// next.config.ts — konfigurasi Next.js + security headers
import type { NextConfig } from 'next';

// ─── Security headers ───────────────────────────────────────────────────────

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  {
    key:   'Permissions-Policy',
    // camera dan microphone diizinkan (self) untuk fitur barcode scanner & audio note
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
      "frame-src 'self' https://accounts.google.com",
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

// ─── Config ────────────────────────────────────────────────────────────────

const config: NextConfig = {
  reactStrictMode: true,

  // Error saat ada TS atau ESLint error — tidak pernah ignore
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },

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
      // Service Worker wajib tanpa cache agar update langsung aktif
      {
        source:  '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type',  value: 'application/javascript' },
        ],
      },
    ];
  },

  // Hapus console.log di production, pertahankan warn dan error
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['warn', 'error'] }
        : false,
  },

  // Suppress protobufjs "Critical dependency" warning — ini dari firebase-admin (server-side)
  // dan tidak mempengaruhi fungsi app. Mark firebase-admin sebagai server-only external.
  serverExternalPackages: ['firebase-admin', '@google-cloud/firestore'],

  webpack(config, { isServer }) {
    if (isServer) {
      // Suppress protobufjs dynamic require warning dari firebase-admin chain
      config.ignoreWarnings = [
        { module: /node_modules\/@protobufjs\/inquire/ },
        { module: /node_modules\/protobufjs/ },
      ];
    }
    return config;
  },
};

export default config;
