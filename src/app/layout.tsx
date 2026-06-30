import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/shared/providers';
import './globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NalaKoe',
    template: '%s — NalaKoe',
  },
  description: 'Catatan pribadimu yang hidup dan bernapas',
  applicationName: 'NalaKoe',
  authors: [{ name: 'NalaKoe' }],
  keywords: ['catatan', 'jurnal', 'diary', 'notes', 'personal'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NalaKoe',
  },
  openGraph: {
    type: 'website',
    siteName: 'NalaKoe',
    title: 'NalaKoe',
    description: 'Catatan pribadimu yang hidup dan bernapas',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

/**
 * Inline script injected before React hydrates.
 * Membaca tema dari Zustand persist key 'nalakoe-ui' (bukan key tersendiri)
 * dan mengaplikasikan .dark ke <html> sebelum first paint — eliminates FOUC.
 *
 * Format Zustand persist: { state: { theme, sidebarOpen, accentColor } }
 * MUST remain a raw string (no template literals, no imports).
 */
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('nalakoe-ui');
    var theme = stored ? JSON.parse(stored)?.state?.theme : null;
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = theme === 'dark' || ((!theme || theme === 'system') && prefersDark);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
