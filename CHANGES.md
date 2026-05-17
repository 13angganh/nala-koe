# CHANGES.md — Sesi 14 (Audit Fix v4)

**Sesi:** 14 · **Tanggal:** 2026-05-14 · **Tipe:** Audit Penuh v4 — 13 Temuan, 0 Sisa

---

## Ringkasan

Audit ulang dengan standar prompt v4. Semua 13 temuan (1 Kritis, 4 Penting, 5 Perlu Fix, 3 Saran) telah diperbaiki. Status: **0 temuan — siap deploy ke Vercel.**

---

## File Baru

| File | Alasan |
|------|--------|
| `src/lib/query-client.ts` | **[PENTING]** Singleton QueryClient terpisah sesuai standar v4 — importable dari test utils |
| `src/hooks/use-service-worker.ts` | **[PENTING]** Register SW saat app mount, cek update otomatis |
| `src/hooks/use-pwa-install.ts` | **[PENTING]** Capture beforeinstallprompt untuk trigger install programatik |
| `src/components/shared/pwa-install-banner.tsx` | **[PENTING]** Banner install PWA dengan delay 30 detik, dismissable |
| `tests/utils.tsx` | **[SARAN]** Test render helper dengan QueryClient isolated per test |
| `database.rules.json` | **[PERLU FIX]** RTDB rules deny-all default — wajib ada sebelum deploy |

## File Diubah

| File | Alasan |
|------|--------|
| `src/constants/config.ts` | **[KRITIS]** Tambah `SESSION_COOKIE_NAME`, `SESSION_DURATION_DAYS`, `SESSION_DURATION_SECONDS` — satu sumber kebenaran |
| `src/middleware.ts` | **[KRITIS]** Pakai `SESSION_COOKIE_NAME` dari constants — tidak ada string literal |
| `src/app/api/auth/session/route.ts` | **[KRITIS]** Pakai `SESSION_COOKIE_NAME` + `SESSION_DURATION_SECONDS` dari constants |
| `src/lib/api-auth.ts` | **[KRITIS]** Pakai `SESSION_COOKIE_NAME` dari constants |
| `src/lib/logger.ts` | **[PENTING]** Tambah Firestore `error_logs` persistence untuk warn+error level; backward compatible dengan semua call signatures |
| `src/app/error.tsx` | **[PENTING]** Hapus emoji ⚠️, ganti ke Lucide AlertTriangle; teks "Tim kami sudah diberitahu" valid setelah logger ke Firestore |
| `src/components/shared/providers.tsx` | **[PENTING]** Lengkap: ServiceWorkerInit + NetworkStatus + PwaInstallBanner + ReactQueryDevtools (dev) + import queryClient dari `lib/query-client` |
| `src/stores/ui.store.ts` | **[PERLU FIX]** Ganti `'#0ea5e9'` ke `colors.brand[500]`; tambah action names di semua set() |
| `src/stores/auth.store.ts` | **[PERLU FIX]** Tambah action names di semua set() |
| `src/stores/notes.store.ts` | **[PERLU FIX]** Tambah action names di semua set() |
| `src/stores/settings.store.ts` | **[PERLU FIX]** Tambah action names di semua set() |
| `tailwind.config.ts` | **[PERLU FIX]** Tambah surface, text, border CSS variable mapping — `bg-surface-base`, `text-text-primary`, dll sekarang berfungsi |
| `next.config.ts` | **[PERLU FIX + SARAN]** Tambah `typescript.ignoreBuildErrors: false` dan `eslint.ignoreDuringBuilds: false`; Permissions-Policy dengan komentar justifikasi camera/mic |
| `src/app/globals.css` | **[SARAN]** Tambah `--border-default` (light + dark) dan `--color-success/warning/error/info` CSS variables |
| `firestore.rules` | Tambah rule `error_logs` — write-only dari authenticated client, read false |
| `firebase.json` | Tambah `database.rules` reference |
| `src/hooks/index.ts` | Export `use-service-worker` dan `use-pwa-install` |
| `src/components/shared/index.ts` | Export `PwaInstallBanner` |
| `package.json` | Tambah `tailwindcss-animate ^1.0.7` ke devDependencies — dipakai oleh `tailwind.config.ts` plugins |

---

# CHANGES.md — Sesi 13 (Audit Fix)

**Sesi:** 13B · **Tanggal:** 2026-05-10 · **Tipe:** Audit Penuh — 14 Temuan, 0 Sisa

---

## Ringkasan

Sesi ini adalah audit menyeluruh sebelum deploy ke Vercel. Semua 14 temuan (3 Kritis, 4 Penting, 4 Perlu Fix, 3 Saran) telah diperbaiki. Status: **0 temuan — siap deploy.**

---

## File Baru

| File | Alasan |
|------|--------|
| `src/app/api/auth/session/route.ts` | **[KRITIS]** Session cookie httpOnly via Firebase Admin — menggantikan `document.cookie` tidak aman |
| `src/lib/api-auth.ts` | **[PENTING]** Helper `verifySession()` untuk semua protected API route |
| `firestore.rules` | **[KRITIS]** Firestore security rules — wajib ada sebelum deploy |
| `storage.rules` | **[KRITIS]** Firebase Storage security rules |
| `firestore.indexes.json` | **[KRITIS]** Composite indexes untuk query notes yang efisien |
| `firebase.json` | Wire up semua rules ke Firebase CLI |
| `src/components/shared/providers.tsx` | **[PENTING]** Terpusatkan semua global providers (QueryClient + Theme + Toaster) |

## File Diubah

| File | Alasan |
|------|--------|
| `src/app/(auth)/login/page.tsx` | **[KRITIS]** Ganti `document.cookie` ke `POST /api/auth/session` (httpOnly) |
| `src/app/(auth)/register/page.tsx` | **[KRITIS]** Ganti `document.cookie` ke `POST /api/auth/session` (httpOnly) |
| `src/components/layouts/header.tsx` | **[KRITIS]** Ganti `document.cookie = ''` ke `DELETE /api/auth/session` saat logout |
| `src/app/(protected)/layout.tsx` | Ganti `document.cookie` ke `DELETE /api/auth/session`, hapus ThemeProvider lokal |
| `src/app/error.tsx` | **[KRITIS]** Hapus `import * as Sentry`, ganti ke `logger.error()` |
| `src/app/global-error.tsx` | **[KRITIS]** Hapus `import * as Sentry`, ganti ke `console.error()`, hapus teks "Tim kami sudah diberitahu" |
| `src/app/api/url-meta/route.ts` | **[PENTING]** Tambah `verifySession()` check — cegah SSRF proxy abuse |
| `src/lib/firebase.ts` | **[PENTING]** Aktifkan `persistentLocalCache` + `persistentMultipleTabManager` untuk offline PWA |
| `src/lib/env.ts` | Hapus `NEXT_PUBLIC_SENTRY_DSN` (tidak dipakai) |
| `src/components/shared/milestone-toast.tsx` | **[PENTING]** Ganti hardcoded hex ke `tokens/colors` dengan komentar justifikasi |
| `src/components/settings/settings-accent-picker.tsx` | **[PENTING]** Ganti hardcoded hex ke `tokens/colors` |
| `src/components/graph/graph-view.tsx` | **[PENTING]** Ganti hardcoded hex Canvas API ke konstanta token dengan komentar |
| `src/components/notes/note-share-card.tsx` | **[PENTING]** Ganti `bg-[#0f172a]` ke `bg-[var(--surface-invert)]` |
| `src/app/globals.css` | Tambah `--surface-invert` CSS variable |
| `src/app/layout.tsx` | Pakai `<Providers>` terpusat, tambah `<Analytics>` dan `<SpeedInsights>` |
| `src/components/shared/index.ts` | Export `Providers` |
| `next.config.ts` | **[SARAN]** `X-Frame-Options: DENY` (sebelumnya `SAMEORIGIN`) |
| `package.json` | Tambah `@vercel/analytics`, `@vercel/speed-insights` |
| `.env.example` | Hapus `NEXT_PUBLIC_SENTRY_DSN`, tambah komentar panduan `FIREBASE_ADMIN_PRIVATE_KEY` |
| `readme-nala-koe.md` | Update status Phase 11 ✅, tambah sesi 12 & 13, update catatan session cookie |

## File Dihapus

| File | Alasan |
|------|--------|
| `src/constants/z-index.ts` | **[PERLU FIX]** Duplikat dari `tokens/z-index.ts` — dihapus, semua import via `@/tokens/z-index` |
| `sentry.client.config.ts` | **[KRITIS]** Sentry tidak digunakan — hapus config file |
| `sentry.server.config.ts` | **[KRITIS]** Sentry tidak digunakan — hapus config file |

---

# CHANGES.md — Phase 12

**Sesi:** 13 · **Tanggal:** 2026-05-09 · **Phase:** Testing, Polish & PWA Final

---

## Ringkasan

Phase terakhir NalaKoe. Fokus pada:
- Unit tests untuk semua fungsi `lib/` yang belum tertutup
- E2E test core journey (login → note → logout) via Playwright
- PWA final: manifest lengkap, service worker v2 dengan 3 strategi caching, icon assets
- **Skip Sentry** — diganti logger sederhana (tidak butuh langganan, tidak memperlambat build Vercel)
- Polish: `next.config.ts` dengan `removeConsole` di production

---

## File Baru

| File | Keterangan |
|------|------------|
| `tests/unit/lib/utils.test.ts` | 8 describe block: `cn`, `slugify`, `truncate`, `generateId`, `isObject`, `clamp`, `debounce`, `stripHtml`, `getContentPreview` |
| `tests/unit/lib/format.test.ts` | 13 describe block: semua fungsi `lib/format.ts` — number, currency, compact, date, time, word count, file size, temperature, percentage |
| `tests/unit/lib/reading-time.test.ts` | 3 describe block: `countWords`, `estimateReadingTime`, `analyzeContent` |
| `tests/unit/lib/normalizer.test.ts` | 4 describe block: `ok`, `err`, `isOk`, `normalizeTimestamp`, `normalizeDocument` |
| `tests/unit/lib/color-gradient.test.ts` | `getTimeGradient` semua 7 periode + `getCurrentTimeGradient` + `getCardAccentColor` |
| `tests/unit/lib/masking.test.ts` | 4 describe block: `maskNIK`, `maskPhone`, `maskEmail`, `maskCardNumber` |
| `tests/e2e/flows/note-journey.spec.ts` | E2E Playwright: login → dashboard → notes → create note → logout → redirect unauthenticated |
| `scripts/generate-icons.mjs` | Script generate 8 ukuran icon PWA + shortcut icons + apple-touch-icon via `canvas` package |

## File Diperbarui

| File | Perubahan |
|------|-----------|
| `src/app/layout.tsx` | Hapus Sentry import; tambah PWA meta tags (`mobile-web-app-capable`, `apple-*`); tambah icon links di `metadata.icons` |
| `src/lib/logger.ts` | Hapus Sentry dynamic import dan `sendToSentry` — logger sekarang pure console. Tidak ada perubahan API publik. |
| `next.config.ts` | Hapus `@sentry/nextjs` wrapper; tambah header Cache-Control untuk `sw.js`; tambah `compiler.removeConsole` di production |
| `public/manifest.json` | Tambah `scope`, `dir`, `orientation: portrait-primary`; tambah `type` di shortcut icons; tambah screenshots placeholder |
| `public/sw.js` | Service worker v2: cache version bump; pisah 3 strategi (`cacheFirst`, `staleWhileRevalidate`, `networkFirstWithOfflineFallback`); tambah expiry check; Firebase/API selalu NetworkOnly; handle `SKIP_WAITING` message |
| `package.json` | Hapus `@sentry/nextjs` dan `next-pwa`; tambah `canvas` di devDependencies (untuk icon gen); tambah `@vitejs/plugin-react` devDep; tambah script `generate:icons` |

---

## Catatan Skip Sentry

Sentry di-skip karena:
1. Membutuhkan langganan berbayar untuk project aktif
2. `@sentry/nextjs` webpack plugin memperlambat Vercel build secara signifikan (~30–60 detik ekstra)
3. Firebase sendiri sudah punya error logging di console

Jika ingin Sentry kembali di masa depan:
- Tambah `@sentry/nextjs` ke dependencies
- Set `NEXT_PUBLIC_SENTRY_DSN` di Vercel environment variables
- Uncomment import di `logger.ts`
- Bungkus config dengan `withSentryConfig()` di `next.config.ts`

---

## Checklist Phase 12

- [x] Unit tests: semua fungsi `lib/` (utils, format, reading-time, normalizer, color-gradient, masking)
- [x] E2E tests: login → buat note → logout
- [x] PWA manifest final (scope, dir, screenshots, icon types)
- [x] Service worker v2 (3 strategi + expiry + Firebase bypass)
- [x] Icon generator script (8 sizes + apple-touch-icon + shortcuts)
- [x] Skip Sentry (tidak ada build overhead, tidak butuh subscription)
- [x] `next.config.ts` polish (`removeConsole` production, Cache-Control sw.js)
- [x] README diupdate

---

## Catatan Deploy Vercel

Sebelum deploy, pastikan di Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

Build command: `next build` (default)
Output directory: `.next` (default)
Node.js version: 20.x
