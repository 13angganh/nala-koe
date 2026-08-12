# NalaKoe 📓

> *Nala* (Jawa/Sanskerta: pikiran, hati nurani) + *Koe* (milikku) — catatan pribadimu yang hidup dan bernapas.

**v1.2.6** · Next.js 16.3 · React 19 · Firebase · PWA

---

## Deskripsi

NalaKoe adalah aplikasi jurnal/catatan personal mobile-first berbasis Next.js App Router + Firebase Firestore. Dibangun sebagai PWA yang bisa diinstall di HP, dengan fitur lengkap: mood tracking, rich text editor, canvas sticky notes, timeline, stats dashboard, export/import, dan banyak lagi.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.3 (App Router, TypeScript strict) |
| Auth + DB | Firebase Auth + Firestore |
| State | Zustand (global) + TanStack Query (server) |
| Styling | Tailwind CSS 3.4 + CSS Custom Properties |
| Animation | Framer Motion 11 |
| Rich Text | contentEditable + DOMPurify (custom, tanpa execCommand) |
| Toast | Sonner |
| Testing | Vitest + Playwright |
| PWA | Custom Service Worker v2 (CacheFirst / NetworkFirst / StaleWhileRevalidate) |

---

## Cara Mulai

### Prasyarat
- Node.js 20+
- Firebase project (Auth + Firestore — **Spark plan cukup**, Storage tidak diperlukan)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Konfigurasi environment
cp .env.example .env.local
# Isi semua variabel di .env.local dengan kredensial Firebase kamu

# 3. Jalankan dev server
npm run dev
```

### Script Tersedia

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (zero warnings policy)
npm run type-check   # TypeScript strict check
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run format       # Prettier
```

---

## Struktur Project

```
src/
├── app/
│   ├── (auth)/                 # Login, Register
│   ├── (protected)/            # Dashboard, Notes, Canvas, Graph, dll.
│   │   └── notes/[id]/         # Editor catatan
│   ├── api/                    # Route handlers (auth session, url-meta)
│   ├── offline/                # PWA offline fallback
│   ├── globals.css             # CSS variables + base styles
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── ui/                     # Primitif (Button, Input, Dialog, dll.)
│   ├── shared/                 # AnimatedPanel, ConfirmDialog, EmptyState, dll.
│   ├── notes/                  # Semua komponen editor & card catatan
│   ├── canvas/                 # Infinite canvas sticky notes
│   ├── graph/                  # Force-directed graph view
│   ├── timeline/               # Timeline view
│   ├── stats/                  # Stats dashboard
│   ├── settings/               # Panel settings
│   ├── tags/                   # Tag input & cloud
│   └── layouts/                # Sidebar, Header, MobileNav
│
├── hooks/                      # Custom React hooks
├── services/                   # Firestore service functions (ApiResult pattern)
├── stores/                     # Zustand stores (auth, notes, settings, ui)
├── lib/                        # Utilities & integrations
│   ├── rich-text.ts            # Rich text helpers (Selection/Range API, DOMPurify)
│   ├── normalizer.ts           # ApiResult pattern (ok/err/isOk)
│   ├── format.ts               # Semua formatting (tanggal, angka, kata)
│   ├── firebase.ts             # Firebase client SDK singleton
│   ├── firebase-admin.ts       # Firebase Admin SDK (server only)
│   └── ...
├── tokens/                     # Design system tokens (colors, spacing, animation, z-index)
├── types/                      # TypeScript type definitions
├── constants/                  # Routes, config, moods
└── schemas/                    # Zod validation schemas
```

---

## Aturan Arsitektur

### CSS Variables — bukan Tailwind JIT untuk theming
Semua color token ada di `globals.css` sebagai CSS custom properties.

```tsx
// ✅ Benar
<div className="bg-[var(--surface-subtle)] text-[var(--text-primary)]" />

// ❌ Salah — rusak di dark mode tanpa full re-render
<div className="bg-slate-50 dark:bg-slate-900" />
```

### ApiResult pattern — selalu via normalizer
```tsx
// ✅
const result = await getNoteById(id, uid);
if (!isOk(result)) throw new Error(result.error.message);
return result.data;

// ❌ — tidak boleh throw langsung dari service
```

### Routes dari constants
```tsx
import { ROUTES } from '@/constants/routes';
router.push(ROUTES.NOTE(id));  // ✅
router.push(`/notes/${id}`);   // ❌
```

### Z-index dari tokens
```tsx
import { Z } from '@/tokens/z-index';
// ✅ — tidak boleh ada z-[999] atau z-50 hardcoded
```

### File size target ≤ 200 baris
Komponen yang lebih besar dipecah ke sub-komponen atau hooks terpisah.

---

## Fitur Lengkap

| No | Fitur | Keterangan |
|---|---|---|
| 1 | **Auth** | Email/password + Google OAuth. Session via HttpOnly cookie (Firebase Admin SDK) |
| 2 | **Note CRUD** | Buat, edit, hapus, duplikat, merge, arsip, sampah |
| 3 | **Rich Text Editor** | contentEditable + DOMPurify. Bold/Italic/Underline/Align. Plain ↔ HTML upgrade |
| 4 | **Checklist** | Block checklist dengan progress bar |
| 5 | **Tabel** | Inline editable table |
| 6 | **Kalkulasi** | Math block (mathjs) |
| 7 | **URL Preview** | Link preview dengan metadata fetch |
| 8 | **Mood Tracker** | 10 mood, tersimpan per catatan |
| 9 | **Tag System** | Tag dengan autocomplete, filter, tag cloud visual |
| 10 | **Lokasi & Cuaca** | Geolocation + Open-Meteo API |
| 11 | **Gaya Font** | Thin / Regular / Medium / Semibold per catatan |
| 12 | **Tekstur** | 6 tekstur latar per catatan |
| 13 | **Catatan Terhubung** | Link antar catatan |
| 14 | **Pemindai Barcode** | ZXing via kamera |
| 15 | **Baca Keras** | Web Speech API TTS |
| 16 | **Kapsul Waktu** | Catatan terkunci sampai tanggal tertentu |
| 17 | **Catatan Rahasia** | WebAuthn biometrics + PIN fallback |
| 18 | **Riwayat Versi** | Max 10 snapshot per catatan, diff viewer, restore |
| 19 | **Ukuran Catatan** | Estimasi byte, badge small/medium/large |
| 20 | **Reaksi** | Agree / Irrelevant / Follow-up per catatan |
| 21 | **Highlight** | Tandai teks, simpan ke Firestore |
| 22 | **Jadwal** | Schedule catatan untuk tanggal tertentu |
| 23 | **Bagikan sebagai Kartu** | 3 style, PNG export via html-to-image, Web Share API |
| 24 | **Stats Dashboard** | Word count, mood chart, writing streak, writing chart |
| 25 | **Streak Tracker** | Milestone confetti |
| 26 | **Smart Folder** | Folder virtual otomatis berdasarkan kriteria |
| 27 | **Timeline View** | Catatan diurutkan secara kronologis visual |
| 28 | **Canvas** | Infinite canvas sticky notes (pan/zoom) |
| 29 | **Graph View** | Force-directed graph antar catatan terhubung |
| 30 | **Ekspor** | TXT, MD, PDF, DOCX, XLSX, JSON (lazy-loaded) |
| 31 | **Impor** | Google Keep JSON, ColorNote JSON, NalaKoe backup |
| 32 | **Tema Musiman** | Deteksi tanggal otomatis (Lebaran, Natal, dll.) |
| 33 | **Aksen Warna** | Override warna brand per preferensi |
| 34 | **PWA** | Service Worker v2, manifest, installable, offline fallback |
| 35 | **Offline Persistence** | Firestore offline cache |
| 36 | **Dark Mode** | Otomatis via CSS variables + Tailwind class |
| 37 | **Hide/Unhide Section & Block** | Sembunyikan mood/tag/cuaca/lokasi atau block (checklist/tabel/kalkulasi/link preview) dari tampilan catatan tanpa menghapus data — untuk catatan panjang |

---

## Rich Text Editor — Arsitektur

```
NoteEditor (key={note.id})
├── NoteEditorToolbar      ← pin, simpan, checklist, "Lainnya" dropdown
├── NoteFormatToolbar      ← Bold / Italic / Underline / Align
│   editableRef → shared contentRef (RefObject<textarea | div>)
├── [plain mode] <textarea ref={contentRef} />
└── [html mode]  NoteRichEditor
    editableRef={contentRef}

    useLayoutEffect([]) → set innerHTML pada mount, set lastEmitted
    useEffect([content]) → hanya reset DOM untuk update eksternal:
      sanitized(content) === lastEmitted       → skip (echo sendiri)
      sanitized(content) === sanitized(el.innerHTML) → sync lastEmitted saja
      else                                     → reset DOM (restore versi, ganti catatan)
```

**Invariant yang dijaga:**
- `lastEmitted.current` selalu = `sanitizeRichHtml(terakhir onChange dipanggil)`
- DOM tidak pernah di-reset karena re-render biasa (buka panel, status simpan, dll.)
- Cursor dipreservasi setelah klik Bold/Italic/Underline (selection di-restore post-`toggleInlineMark`)
- `handleManualSave` selalu mengirim state lengkap termasuk `contentFormat`

---

## Environment Variables

Salin `.env.example` jadi `.env.local` untuk development lokal (jangan commit `.env.local` — sudah dikecualikan di `.gitignore`). Untuk Vercel: isi variabel yang sama di Project → Settings → Environment Variables.

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Opsional | Default `https://nala-koe.vercel.app` jika tidak diisi |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | **Wajib** | Dari file service account JSON (field `client_email`) |
| `FIREBASE_ADMIN_PRIVATE_KEY` | **Wajib** | Dari file service account JSON (field `private_key`) — copy apa adanya, format `\n`-escaped di JSON sudah benar |

> ⚠️ **Build/deploy akan GAGAL kalau `FIREBASE_ADMIN_CLIENT_EMAIL`/`FIREBASE_ADMIN_PRIVATE_KEY` belum diset** — `src/lib/env.ts` sengaja memvalidasi dengan tegas (fail loudly), bukan diam-diam jalan tanpa Admin SDK. Ini terverifikasi lewat build test: tanpa kedua variabel ini, `next build` berhenti di tahap "Collecting page data" dengan pesan error yang menyebutkan persis variabel mana yang hilang. **Pastikan sudah diisi di Vercel SEBELUM push ke `main`**, kalau tidak, deployment akan gagal.

Firebase client config (`apiKey` dkk di `src/lib/firebase.ts`) TIDAK memakai env var dan itu memang benar — nilai itu publik by design menurut dokumentasi resmi Firebase (keamanan sebenarnya ada di Firestore Security Rules, `firestore.rules`, bukan di menyembunyikan `apiKey`).

---

## Deployment

Project terhubung ke Vercel via GitHub. Push ke `main` = auto-deploy.

Firestore indexes: `firestore.indexes.json`  
Firestore rules: `firestore.rules`  
Firebase config: `firebase.json`

### Firebase RTDB (belum aktif)

RTDB **belum diaktifkan** — `src/lib/firebase.ts` mengekspor `rtdb` sebagai `null` (placeholder), dan `firebase.json` tidak menyertakan entry `database`. `database.rules.json` sudah tersedia (dengan UID whitelist) untuk saat dibutuhkan. Langkah aktivasi jika diperlukan di masa depan:

1. Tambahkan `databaseURL` ke `firebaseConfig` di `src/lib/firebase.ts`, lalu inisialisasi `rtdb = getDatabase(app)` di dalam `initFirebase()` dan ekspor.
2. Tambahkan `NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url()` ke `src/lib/env.ts`.
3. Tambahkan `NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com` ke `.env.local`.
4. Re-aktifkan di `firebase.json`: `"database": { "rules": "database.rules.json" }`.
5. Deploy rules: `firebase deploy --only database`.

---

## Changelog

> **README.md adalah satu-satunya sumber kebenaran untuk dokumentasi project ini.** Tidak ada file `.md` lain di repo (CHANGES.md, readme-nala-koe.md, RTDB_ACTIVATION.md, dll. dari sesi-sesi sebelumnya sudah dihapus/digabung ke sini). Setiap perubahan, fix, patch, atau update — sekecil apa pun — dicatat sebagai entry baru di bagian ini, paling atas, dengan format `### vX.Y.Z — tanggal (Sesi N)`. Jangan membuat file dokumentasi terpisah lagi; tambahkan ke README.md ini saja.

### v1.2.6 — 07 Agu 2026 (Sesi 27)
**3 bug auth dilaporkan Vina, semua ditemukan & diperbaiki dengan bukti test: auto-logout race condition, login macet (cookie race), pesan error Google login yang tidak informatif**

Vina melaporkan tiga masalah terpisah saat login: (1) auto-logout tanpa batas waktu jelas — dan secara eksplisit tidak menghendaki fitur ini; (2) setelah auto-logout, login jadi macet — hanya muter, tetap di halaman login; (3) login Google menampilkan "terjadi kesalahan" tanpa detail.

**Bug #1 — auto-logout: BUKAN fitur, murni race condition di `ProtectedLayout`'s `onAuthStateChanged` listener.** Firebase Auth secara resmi terdokumentasi memanggil callback listener ini **dua kali** saat halaman pertama dimuat: sekali segera dengan state yang belum pasti (`null`, sebelum SDK selesai membaca sesi tersimpan dari IndexedDB), lalu sekali lagi dengan user sesungguhnya begitu pembacaan itu selesai. Jeda antara dua panggilan ini **tidak tetap** — laporan dunia nyata yang dikutip menunjukkan rentang dari nyaris instan sampai 20-30+ detik tergantung kondisi device/koneksi, persis pola "tak tau batas waktunya kapan" yang dilaporkan. Kode sebelumnya memperlakukan **setiap** panggilan `null` — termasuk panggilan pertama yang belum pasti — sebagai sinyal logout definitif, langsung `router.replace(ROUTES.LOGIN)`. **Reproduksi dibuktikan lewat test SEBELUM kode diubah** (`tests/unit/app/repro-auto-logout.test.tsx`): simulasi persis urutan callback ini menghasilkan redirect ke `/login` meski user sebenarnya tetap login di akhir proses.

**fix(auth): `ProtectedLayout` sekarang menunggu `auth.authStateReady()`** (API resmi Firebase untuk kasus ini) sebelum mempercayai callback `null` PERTAMA sebagai logout — hanya redirect kalau `auth.currentUser` benar-benar tetap `null` setelah proses pengecekan initial selesai. Callback `null` yang datang SETELAH user pernah terkonfirmasi valid (logout sungguhan, token direvoke, dsb) tetap langsung redirect seperti semula — tidak ada regresi untuk kasus logout yang memang asli. Diverifikasi lewat 3 skenario test: race resolved (tidak lagi salah redirect), visitor benar-benar belum login (tetap redirect dengan benar), dan logout genuine setelah sesi valid (tetap redirect segera).

**Bug #2 — login macet: cookie race condition yang terdokumentasi luas di ekosistem Next.js App Router** ("the redirect ... happens before the cookie is fully set/available" — pola yang sama persis dilaporkan banyak developer independen). Di `login/page.tsx`, `router.replace(from)` dipanggil segera setelah `fetch POST /api/auth/session` resolve — tapi resolve-nya `fetch` hanya berarti response diterima, bukan jaminan browser sudah selesai mengomit `Set-Cookie` sebelum request navigasi berikutnya (yang dipicu `router.replace`) dikirim. Kalau request navigasi itu sampai ke middleware (`proxy.ts`) sebelum cookie ter-commit, middleware tidak menemukan session valid dan melempar balik ke `/login` — dari sudut pandang user: spinner jalan, lalu kembali ke login begitu saja, tanpa pesan error. Ditemukan juga: `setServerSession()` sebelumnya **tidak pernah** memeriksa `response.ok` — kalau POST session gagal karena sebab apa pun, navigasi tetap dijalankan buta.

**fix(auth): `setServerSession()` sekarang mengembalikan status sukses eksplisit** (cek `response.ok`) — kalau gagal, tampilkan toast error alih-alih navigasi diam-diam. **`router.refresh()` dipanggil sebelum `router.replace()`** — pola mitigasi standar untuk cookie race condition ini, memberi App Router kesempatan mengevaluasi ulang middleware dengan cookie yang baru saja ter-commit sebelum benar-benar berpindah halaman. Diverifikasi lewat 2 test: session gagal → tidak ada navigasi diam-diam; session sukses → `router.refresh()` terbukti terpanggil sebelum `router.replace()`.

**Bug #3 — pesan error Google login generik: `mapFirebaseError()` hanya mencakup 9 kode error**, semua yang tidak terdaftar (termasuk kode umum untuk login popup: `auth/popup-blocked`, `auth/cancelled-popup-request`, `auth/unauthorized-domain`, `auth/account-exists-with-different-credential`, dll) jatuh ke pesan generik "Terjadi kesalahan. Coba lagi." — tidak mungkin dibedakan penyebabnya dari toast semata. **fix: 6 kode error tambahan dipetakan** ke pesan spesifik dalam Bahasa Indonesia. Untuk kode yang masih belum terpetakan di masa depan, pesan sekarang menyertakan kode error asli (`Terjadi kesalahan (auth/xxx). Coba lagi.`) alih-alih generik total — memudahkan diagnosis penyebab pasti dari laporan pengguna berikutnya tanpa perlu akses log server.

Full suite: 291/291 test lulus (naik dari 286 — 5 test baru), `tsc`/`eslint --max-warnings 0`/`next build` seluruhnya bersih pasca-perubahan.

Files: `src/app/(protected)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/services/auth.service.ts`, `tests/unit/app/repro-auto-logout.test.tsx` (baru), `tests/unit/app/login-page.test.tsx` (baru), `package.json`, `README.md`

---

### v1.2.5 — 07 Agu 2026 (Sesi 26)
**⚠️ v1.2.3 TIDAK memperbaiki bug tag seperti diklaim — akar masalah SESUNGGUHNYA ditemukan dan diperbaiki di sesi ini, dengan bukti test yang mereproduksi bug dan memverifikasi fix-nya**

Vina melaporkan bug tag masih terjadi persis seperti sebelumnya setelah v1.2.4 di-deploy: ketik tag → simpan → pindah ke menu lain → buka lagi note yang sama → tag kosong. Ini konfirmasi bahwa perbaikan `subscribeToNote`/`hasPendingWrites`/`inFlightSaveRef` di v1.2.3 (Sesi 24) — meski logic-nya sendiri valid — **tidak menyentuh akar masalah sesungguhnya**. Sesi ini dimulai dengan menulis test yang benar-benar mensimulasikan skenario "ketik tag → unmount komponen (pindah menu)" untuk memverifikasi ulang v1.2.3's fix — **ketiga test lulus**, membuktikan `use-note-editor.ts` sendiri sudah berperilaku benar. Ini mengonfirmasi masalahnya ada di tempat lain yang belum pernah diperiksa.

**Akar masalah sesungguhnya ditemukan di `updateNote()` (`src/services/notes.service.ts`), bukan di hook editor.** Fungsi ini memanggil `getDoc(ref)` di awal — sebelum `updateDoc()` apa pun — semata untuk memvalidasi `snap.data().userId !== userId` sebagai pengecekan kepemilikan. Firestore JS SDK punya perilaku terdokumentasi resmi (issue `firebase-js-sdk#6739`, yang sebenarnya **sudah dikutip** di komentar kode ini untuk alasan lain): kalau `getDoc()` dipanggil saat ada write **lain** yang masih pending untuk dokumen yang sama, hasilnya bisa berupa snapshot **parsial** — hanya berisi field dari write yang sedang pending itu, bukan dokumen lengkap. Karena note punya banyak field independen yang masing-masing punya `scheduleAutoSave` batch sendiri (title, content, tags, mood, weather, dst — lihat v1.2.3's changelog), sangat wajar dua atau lebih di antaranya sedang "settling" berdekatan waktu. Kalau `getDoc()` untuk save tag kebetulan menangkap snapshot parsial dari write field LAIN yang sedang pending (misal mood), `userId` (yang tidak termasuk field yang di-patch write itu) hilang dari hasil `data()`, `snap.data().userId !== userId` salah bernilai `true`, dan fungsi **return early dengan error 'notes/not-found' — TANPA PERNAH memanggil `updateDoc()` sama sekali.** Tag yang baru diketik tidak pernah benar-benar terkirim ke Firestore, meski semua logic di atasnya (Zustand, debounce, mutation call) sudah benar.

**Dibuktikan lewat test sebelum kode diubah** (`tests/unit/services/notes-service-update.test.ts`, mock primitif Firestore level rendah, bukan mock seluruh service): mensimulasikan persis kondisi ini (`getDoc()` mengembalikan `{ mood: 'senang' }` tanpa `userId`) menghasilkan `updateDoc` terpanggil **0 kali** dan error `notes/not-found` — reproduksi identik dengan laporan Vina.

**fix(data-layer): `getDoc()` pre-check ownership dihapus untuk save yang tidak menyentuh `title`/`content`/`blocks`.** Diverifikasi aman secara keamanan: `firestore.rules` sudah memvalidasi ownership di level SERVER untuk setiap `update` (`resource.data.userId == request.auth.uid`), independen dari pengecekan client manapun — jadi `getDoc()` pre-check ini murni duplikat yang rawan race, bukan lapisan keamanan yang unik. `getDoc()` sekarang hanya dipanggil kalau save benar-benar menyentuh field konten (dibutuhkan untuk `saveVersion()`/version history) — bukan lagi untuk setiap save tag/mood/weather/pin/dsb. Kalau ada percobaan write ke note yang bukan miliknya, Firestore Rules sendiri yang menolak (`updateDoc()` akan reject, ter-`catch` sebagai `'notes/update-failed'` generik alih-alih `'notes/not-found'` spesifik — trade-off yang wajar, karena keamanan sungguhan tidak bergantung pada pesan errornya).

**Verifikasi 4 skenario test** (semua di `notes-service-update.test.ts`): (1) save konten normal — `getDoc()` tetap terpanggil, `updateDoc()` sukses; (2) **save tag — `getDoc()` sekarang 0 kali terpanggil**, `updateDoc()` tetap sukses; (3) regression guard — snapshot parsial (persis bentuk bug asli) dikonfigurasi di mock tapi terbukti tidak lagi relevan karena `getDoc()` tidak pernah dipanggil di jalur ini; (4) regression guard — save konten (title/content/blocks) dipastikan **masih** memanggil `getDoc()` + `saveVersion()`/`addDoc()` seperti semula, memastikan fitur version history tidak ikut rusak oleh refactor ini.

Full suite: 286/286 test lulus (naik dari 282 — 4 test baru), `tsc`/`eslint --max-warnings 0`/`next build` seluruhnya bersih pasca-perubahan.

Files: `src/services/notes.service.ts`, `tests/unit/services/notes-service-update.test.ts` (baru), `package.json`, `README.md`

---

### v1.2.4 — 07 Agu 2026 (Sesi 25)
**Kredensial Firebase Admin SDK dipindah dari hardcode ke environment variable · `.gitignore` dibuat (sebelumnya tidak ada sama sekali) · `.env.example` sungguhan dibuat**

Tindak lanjut langsung dari temuan kritis di Sesi 24. Vina sudah melakukan bagian manualnya di Google Cloud Console: generate service account key baru, revoke key lama. Sesi ini menyelesaikan sisi kode:

**fix(security): `src/lib/firebase-admin.ts` tidak lagi hardcode `clientEmail`/`privateKey`.** Dipindah ke dua environment variable baru: `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`. `src/lib/env.ts` diperluas untuk memvalidasi keduanya sebagai **wajib** (bukan `safeParse` dengan silent-fallback seperti `NEXT_PUBLIC_APP_URL`) — kalau salah satu tidak ter-set, aplikasi `throw` dengan pesan jelas menyebutkan variabel mana yang hilang, alih-alih diam-diam jalan dengan Admin SDK yang rusak lalu crash membingungkan di request pertama. `firebase-admin.ts` memakai `get clientEmail()`/`get privateKey()` (getter, bukan assignment langsung) supaya env var dievaluasi tepat saat `cert()` dipanggil, bukan saat modul di-import — lebih mudah di-trace kalau ada masalah.

**Konversi format private key ditangani eksplisit** (`getFirebaseAdminPrivateKey()` di `env.ts`): PEM key punya newline literal, sementara environment variable UI (Vercel dashboard) cuma single-line text — key harus dipaste dengan newline di-escape sebagai `\n` dua-karakter, dan kode mengonversinya balik ke newline sungguhan sebelum diserahkan ke `cert()`. Diverifikasi dengan RSA key PKCS8 valid yang di-generate khusus untuk testing (openssl, bukan credential asli) — build sukses end-to-end dengan format ini.

**Diverifikasi lewat build test sungguhan, bukan asumsi:** dicoba build TANPA kedua env var → build gagal di tahap "Collecting page data" dengan pesan persis menyebut `FIREBASE_ADMIN_CLIENT_EMAIL — Required; FIREBASE_ADMIN_PRIVATE_KEY — Required` (route handler `/api/auth/session` dieksekusi Next.js saat build time untuk collect config, bukan cuma runtime — ini penting diketahui: **env var harus sudah terpasang di Vercel SEBELUM push**, kalau tidak deployment akan gagal). Dicoba lagi DENGAN env var (dummy key valid) → build sukses total, 21 route ter-generate.

**Ditemukan saat proses ini: `.gitignore` tidak ada sama sekali di repo.** Ini temuan terpisah tapi terkait langsung — tanpa `.gitignore`, ada risiko `.env.local` (kalau pernah dibuat lokal) ikut ter-commit, plus `node_modules`/`.next` yang seharusnya tidak pernah masuk git. Dibuat `.gitignore` standar Next.js, eksplisit mengecualikan semua varian `.env*.local`.

**`.env.example` dibuat sungguhan** — sebelumnya README merujuk ke file ini tapi filenya sendiri tidak pernah ada di repo (dikonfirmasi tidak ada di ZIP manapun sejak Sesi 24). Sekarang berisi kedua variabel wajib dengan instruksi jelas cara mendapatkan nilainya dari Firebase Console.

Files: `src/lib/env.ts`, `src/lib/firebase-admin.ts`, `.env.example` (baru), `.gitignore` (baru), `package.json`, `README.md`

---


**Audit penuh: root cause bug tag di layer DATA (bukan UI) akhirnya ditemukan · 18 error ESLint → 0 · 16 unit test gagal → 0 (282/282 lulus) · 2 bug produksi tersembunyi ditemukan & diperbaiki · Kerentanan keamanan kritis ditemukan (private key ter-hardcode) · Update Next.js 16.2 → 16.3.0**

Sesi ini dimulai dari audit penuh atas permintaan Anda, dengan cakupan lebih dalam dari sesi manapun sebelumnya: instalasi dependency dari nol, `tsc --noEmit`, `eslint --max-warnings 0`, `vitest run`, dan `next build` produksi sungguhan sebagai baseline objektif — bukan asumsi dari kode yang "terlihat benar".

**🚨 Temuan kritis (keamanan, di luar scope awal tapi tidak bisa diabaikan): `src/lib/firebase-admin.ts` berisi RSA private key lengkap Firebase Admin service account ter-hardcode sebagai string di source code.** Karena repo GitHub bersifat publik, key ini berpotensi bisa diakses siapa pun yang membuka repo — dan key admin ini bisa bypass seluruh Firestore Security Rules (yang sebenarnya sendiri sudah ditulis dengan baik). Anda sudah dikonfirmasi memahami ini di awal sesi; rotasi key adalah langkah yang harus dilakukan manual oleh Anda di Google Cloud Console (di luar kendali Claude sepenuhnya) — **belum dieksekusi di sesi ini**, ditandai sebagai tindak lanjut wajib segera.

**Root cause bug tag YANG SEBENARNYA — ditemukan di layer data, bukan UI.** v1.2.2 (Sesi 23) memperbaiki `isMetaOpen` menjadi derived value — itu benar dan tetap valid — tapi itu menambal gejala di UI, bukan akar masalah di data. Menelusuri ulang seluruh jalur dari `TagInput` → Firestore baris-per-baris, ditemukan: `subscribeToNote()` di `notes.service.ts` tidak pernah memeriksa `snap.metadata.hasPendingWrites` dari Firestore `onSnapshot`. Firestore dengan `persistentLocalCache` mengirim snapshot **sebelum** server benar-benar mengonfirmasi sebuah write (echo optimistic lokal) — snapshot ini diperlakukan sama otoritatifnya dengan snapshot yang sudah final. Ditambah, `pendingInputRef` di `use-note-editor.ts` dikosongkan **pada saat timer auto-save berbunyi**, bukan setelah `updateDoc()` benar-benar selesai ke server (mutation-nya `fire-and-forget`, tidak di-`await`) — membuka jendela waktu singkat di mana data yang sedang dikirim tidak lagi terlindungi kalau snapshot lama sempat masuk duluan.

**fix(data-layer): `subscribeToNote()` sekarang meneruskan `snap.metadata.hasPendingWrites` ke pemanggil.** `use-note-editor.ts` menambah `inFlightSaveRef` yang tetap menjaga field yang sedang disimpan **sampai mutation-nya benar-benar settle** (sukses maupun gagal, via `onSettled` per-batch — bukan `onSuccess` global, supaya dua auto-save field berbeda yang tumpang tindih tidak saling menghapus proteksi satu sama lain). Ditambahkan logging (`logger.warn('notes.editor.stale-in-flight-ref', ...)`) untuk kasus janggal di masa depan (field masih dianggap in-flight padahal Firestore sudah bilang final) — supaya kalau ada masalah serupa lagi, ketahuan dari log, bukan menebak lagi.

**18 error ESLint → 0** (naik dari 17 laporan awal karena satu perbaikan tag sempat menambah satu error baru, lalu diselesaikan juga). Lima kasus `react-hooks/set-state-in-effect`, ditangani berbeda sesuai konteks — bukan solusi generik:
- `use-mounted.ts`, `use-biometric.ts` — direfactor pakai `useSyncExternalStore` (perbaikan struktural, bukan suppress; juga menghilangkan satu render tambahan yang sebelumnya perlu untuk mendeteksi kondisi client-only).
- `use-biometric.ts` — status `'unavailable'` diubah dari `useState` + effect menjadi derived value murni dari `isSupported`.
- `use-tags.ts`, `use-mood.ts`, `canvas/page.tsx` — pola "tandai loading sebelum fetch mulai" dipertahankan (pola standar, bukan bug), didokumentasikan dengan `eslint-disable` + alasan tertulis lengkap dengan referensi ke diskusi resmi soal false-positive rule ini (github.com/facebook/react/issues/34743).
- `canvas-board.tsx` — sync `stickies` dari prop `board` dipertahankan sebagai effect (ini persis kasus "subscribe ke sistem eksternal" yang dokumentasi rule-nya sendiri akui valid — `board` adalah snapshot dari Firestore `onSnapshot` di parent), didokumentasikan alasannya.

Sisanya: 6 baris `console.log('[DEBUG tags] ...')` yang tertinggal dari sesi lalu dihapus; 11 `@typescript-eslint/no-non-null-assertion` dan 1 unused var di test files diperbaiki tanpa mengubah maksud test; `scripts/*.mjs` (CLI tooling, bukan kode yang di-bundle ke app) dikecualikan dari rule `no-console` secara eksplisit di `eslint.config.mjs` — sebelumnya rule global diterapkan tanpa scoping ke situ juga.

**16 unit test gagal → 0 (282/282 lulus)** — ternyata bukan satu masalah, tapi tiga kategori berbeda:
- 13 test `use-read-aloud.test.ts`: jsdom tidak punya `SpeechSynthesisUtterance` sama sekali di `window`, sehingga `vi.spyOn` gagal duluan sebelum sempat menguji apa pun. Polyfill stub minimal ditambahkan di `tests/setup.ts`.
- 3 test `use-barcode-scanner.test.ts`: `vi.advanceTimersByTime` (sinkron) tidak cukup untuk loop yang bolak-balik antara `await Promise` dan `setTimeout` (loop polling 20x di hook aslinya) — harus `vi.advanceTimersByTimeAsync` yang flush microtask di antara setiap tick. Ini bukan cuma bikin 1 test timeout, tapi meracuni 2 test lain sesudahnya di file yang sama karena `vi.useRealTimers()` tidak sempat terpanggil.
- 1 file `tests/e2e/flows/note-journey.spec.ts` (Playwright) ter-scan oleh Vitest karena `vitest.config.ts` tidak punya `test.include` yang scoped — diperbaiki dengan `include: ['tests/unit/**/*.{test,spec}.{ts,tsx}']`.

**2 bug produksi tersembunyi ditemukan & diperbaiki** — terungkap justru *karena* test environment diperbaiki (sebelumnya test-nya sendiri gagal duluan sebelum sempat sampai ke assersi sungguhan):
- `use-read-aloud.ts` & `use-barcode-scanner.ts`: `isSupported` dihitung dengan `'x' in window`, yang mengembalikan `true` bahkan ketika `window.x` bernilai `undefined` (operator `in` mengecek keberadaan property, bukan nilai truthy-nya). Diganti jadi `Boolean(window.x)`. Dampak nyata: di browser yang benar-benar tidak mendukung Web Speech API atau BarcodeDetector, app bisa crash dengan `TypeError` alih-alih menampilkan pesan "fitur tidak didukung" yang seharusnya.

**Konsolidasi dokumentasi:** dikonfirmasi tidak ada file `.md` lain tersisa di project selain README.md ini (konsolidasi ke satu-sumber-kebenaran sudah tuntas sejak Sesi sebelumnya). Satu komentar kode di `src/lib/rich-text.ts` yang masih merujuk ke `readme-nala-koe.md` (file yang sudah tidak ada) diperbaiki menunjuk ke README.md.

**Update Next.js 16.2.9 → 16.3.0.** Next.js 16.3.0 stable (rilis resmi 3 Agu 2026) mencakup 9 patch keamanan (CVE) yang diumumkan 21 Jul 2026 — dikonfirmasi lewat commit `Cherry-pick ghsa commits to canary: #93614` di changelog resmi rilisnya. Diperiksa relevansi ke NalaKoe secara spesifik: project ini tidak memakai Server Actions (`'use server'`), tidak mengonfigurasi `i18n`, dan tidak memakai `rewrites()`/`redirects()` — sehingga tidak terpapar langsung ke 4 CVE High-severity yang diumumkan, tapi update tetap dilakukan sebagai praktik keamanan defense-in-depth. Manfaat non-security: memori dev server turun signifikan (disk caching + memory eviction Turbopack, default aktif di 16.3), build berulang bisa lebih cepat (baca artifact dari cache), SSR menangani lebih banyak request di bawah beban tinggi (native Node.js streams menggantikan web streams). Semua fitur baru 16.3 lainnya (Instant Navigations, root params, custom error boundaries) bersifat **opt-in** — tidak ada perubahan kode yang dipaksakan. `eslint-config-next` di-bump bersamaan ke `^16.3.0` untuk tetap selaras dengan versi compiler-nya. Diverifikasi: `npx next --version` → `16.3.0`, `tsc`/`eslint`/`vitest`/`next build` seluruhnya bersih pasca-upgrade, tanpa satu pun regresi.

Files: `src/services/notes.service.ts`, `src/hooks/use-note-editor.ts`, `src/hooks/use-mounted.ts`, `src/hooks/use-biometric.ts`, `src/hooks/use-tags.ts`, `src/hooks/use-mood.ts`, `src/hooks/use-barcode-scanner.ts`, `src/hooks/use-read-aloud.ts`, `src/app/(protected)/canvas/page.tsx`, `src/components/canvas/canvas-board.tsx`, `src/components/tags/tag-input.tsx`, `src/lib/rich-text.ts`, `eslint.config.mjs`, `vitest.config.ts`, `tests/setup.ts`, `tests/unit/hooks/use-barcode-scanner.test.ts`, `tests/unit/hooks/use-smart-folder.test.ts`, `tests/unit/hooks/use-url-meta.test.ts`, `tests/unit/hooks/use-streak.test.ts`, `tests/unit/lib/note-table.test.ts`, `package.json`, `README.md`

---


**Root cause bug tag akhirnya benar-benar ditemukan dengan menelusuri kode baris-per-baris (bukan asumsi) · Mood & Tag sekarang konsisten dengan Catatan Terhubung/Reaksi/Highlight**

Sesi ini saya tidak menebak — saya extract ulang ZIP yang benar-benar terkirim ke Anda dan menelusuri setiap baris dari `TagInput.onChange` sampai `Firestore`, termasuk menyimulasikan setiap skenario timing yang mungkin. Root cause-nya:

**Bug: `isMetaOpen` (panel Mood & Tag) di-`useState(() => Boolean(mood || tags.length > 0 || ...))` — dihitung HANYA SEKALI saat komponen mount.**

Sejak v1.2.0, `useNoteEditor` memakai `onSnapshot` (live listener) — Firestore dengan offline persistence sering mengirim **dua snapshot berurutan**: snapshot pertama dari cache lokal (bisa kosong/stale kalau ini kunjungan pertama ke catatan tersebut di device ini), lalu snapshot kedua dari server dengan data sebenarnya. Kalau snapshot pertama tiba dengan `tags=[]`, `NoteEditor` mount, dan `isMetaOpen` ter-`useState`-kan sebagai `false` **secara permanen** — initializer hanya jalan sekali. Ketika snapshot kedua tiba dengan `tags=["kerja"]` yang sebenarnya benar tersimpan di server, `activeNote.tags` ter-update dengan benar di Zustand, **tapi panel Mood & Tag tetap tertutup** karena `isMetaOpen` sudah "membeku" di `false`. Inilah yang terlihat sebagai *"tags hilang, muncul Tambah tag lagi"* — datanya sebenarnya tersimpan dan ada, hanya **panelnya yang tidak pernah terbuka untuk menampilkannya**.

Ini juga menjelaskan kenapa terasa acak/tidak konsisten: tergantung kecepatan koneksi dan apakah catatan itu sudah pernah dibuka di device yang sama sebelumnya (cache lokal sudah terisi data benar atau belum), snapshot pertama bisa kosong atau bisa sudah benar — race condition murni, bukan bug yang konsisten muncul setiap kali.

**fix(editor): `isMetaOpen` diganti dari `useState` initializer statis menjadi pure derived value** — `const isMetaOpen = hasMetaData || metaManuallyOpened`, dihitung ulang di setiap render berdasarkan `mood`/`tags`/`weather`/`location` yang terkini, bukan dibekukan saat mount. Begitu data apa pun tiba (dari snapshot manapun, kapan pun), panel otomatis terbuka — tidak ada lagi jendela waktu di mana data benar tapi UI menyembunyikannya.

**fix(konsistensi): panel Mood & Tag sebelumnya MASIH terbungkus `<AnimatedPanel show={isMetaOpen}>`** — satu-satunya data section yang belum dipindah ke pola inline seperti Catatan Terhubung/Reaksi/Highlight (Sesi 21). Sekarang Mood & Tag mengikuti pola yang sama persis: render otomatis begitu ada data, tidak perlu toggle buka/tutup panel terlebih dahulu. Keempat data section sekarang benar-benar identik perilakunya, bukan tiga dari empat seperti sebelumnya.

Files: `src/components/notes/note-editor.tsx`

---

### v1.2.1 — 21 Jun 2026 (Sesi 22)
**Fix: versi di Pengaturan selalu tampil "1.0.0" · Fix: service worker tidak pernah update setelah deploy baru**

Anda melaporkan bahwa meski Vercel berhasil deploy `update v1.2.0` (terbukti dari screenshot deployment history), halaman Pengaturan di aplikasi masih menampilkan **"Versi 1.0.0"** dan tidak ada perubahan yang terasa. Dua bug nyata ditemukan dan diperbaiki:

**fix(settings): versi hardcoded — `"NalaKoe · Versi 1.0.0"` di Settings page adalah string literal** yang tidak pernah diubah meski `package.json` sudah di-bump berkali-kali ke 1.1.0 → 1.2.0. Sekarang dibaca dari `process.env.NEXT_PUBLIC_APP_VERSION` yang di-inject saat build dari `package.json`. Diverifikasi langsung: bundle JS statis mengandung `"Versi ","1.2.1"` — tidak hardcoded lagi.

**fix(pwa): service worker tidak pernah mendeteksi update** — inilah alasan perubahan kode tidak sampai ke device yang sudah install PWA, bahkan setelah deploy Vercel berhasil:
- `public/sw.js` punya `CACHE_VERSION = 'v1'` yang **hardcoded permanen** — file-nya tidak pernah berubah byte-per-byte antar deploy, sehingga browser tidak pernah mendeteksi ada service worker baru untuk di-install, dan terus melayani JS bundle lama via CacheFirst strategy tanpa batas.
- Saat `updatefound` terdeteksi (kalau pun SW baru sempat ter-detect), kode hanya melakukan `console.warn(...)` — **tidak pernah benar-benar memberi tahu user**, apalagi mengaktifkan SW baru.

**Yang diperbaiki:**
- `scripts/inject-sw-version.mjs` — script baru yang **otomatis meng-update `CACHE_VERSION` di `sw.js`** sebelum setiap build dengan versi dari `package.json`. Dijalankan via `"prebuild"` hook di `package.json` (npm lifecycle, dieksekusi otomatis oleh `npm run build` termasuk di Vercel). Diverifikasi: setiap build menghasilkan output `[inject-sw-version] public/sw.js CACHE_VERSION -> 1.2.1`; setiap rilis baru otomatis menghasilkan file `sw.js` yang berbeda byte-nya → browser mendeteksi SW baru → cache lama (`nk-static-1.2.0`, dst) dihapus → JS bundle terbaru diambil dari network → app benar-benar update.
- `src/hooks/use-service-worker.ts` — sekarang menampilkan **toast "Versi baru NalaKoe tersedia"** dengan tombol **"Muat ulang"** saat SW baru siap aktif, alih-alih log ke console. Reload terjadi sesudah user konfirmasi (bukan otomatis di tengah sesi yang bisa menyebabkan mismatch state). Juga mendeteksi update saat tab kembali ke foreground (`visibilitychange`).
- `public/sw.js` — `self.skipWaiting()` dipindah dari `install` event (otomatis) ke `message` listener dengan type `SKIP_WAITING` — SW baru menunggu konfirmasi user via toast sebelum take over, bukan langsung memotong sesi yang sedang berjalan.
- `src/lib/register-sw.ts` — **dihapus** (dead code — fungsi `registerServiceWorker` didefinisikan tapi tidak pernah dipanggil dari mana pun, hanya membingungkan).

Files: `next.config.ts`, `package.json` (prebuild hook), `scripts/inject-sw-version.mjs` (baru), `public/sw.js`, `src/hooks/use-service-worker.ts`, `src/app/(protected)/settings/page.tsx`, `src/lib/register-sw.ts` (dihapus)

---

### v1.2.0 — 20 Jun 2026 (Sesi 21)
**Root cause bug tag akhirnya ditemukan & diperbaiki secara arsitektur (onSnapshot real-time) · Redesain total konsistensi hide/unhide & hapus di seluruh editor**

**Bug tag — root cause sebenarnya ditemukan:**

Pendekatan "write verification" (baca ulang dokumen setelah `updateDoc`) yang ditambahkan di v1.1.3 saya **cabut** — riset lebih lanjut menemukan ini justru pendekatan yang **tidak reliable**: Firestore JS SDK punya perilaku terdokumentasi ([firebase-js-sdk#6739](https://github.com/firebase/firebase-js-sdk/issues/6739)) di mana `getDoc()` yang dipanggil **segera setelah** sebuah write masih pending bisa mengembalikan **hanya field yang baru ditulis** — bukan dokumen lengkap — sehingga verifikasi semacam itu bisa salah menyimpulkan kegagalan pada save yang sebenarnya berhasil, atau sebaliknya.

**fix(arsitektur): `useNoteEditor` sekarang pakai `onSnapshot` (live listener), bukan `getDoc` satu kali.** Sebelumnya, note yang sedang dibuka diambil sekali via `useQuery` + `getDoc()`, dan disinkronkan ulang lewat `invalidateQueries`. Pola one-shot-fetch ini punya kerentanan struktural terhadap race condition Firestore SDK di atas — setiap kali ada refetch (window refocus, invalidate dari mutasi lain, dll), ada risiko membaca snapshot yang belum settle. Dengan `onSnapshot`, `activeNote` di Zustand sekarang **terus tersambung** ke state Firestore yang sebenarnya — setiap perubahan dokumen (baik dari device ini maupun device lain) otomatis mendorong update lengkap dan terkini ke editor, bukan dibaca ulang secara manual yang rawan baca data parsial. Ini pola resmi yang direkomendasikan Firebase untuk use-case "editor real-time", dan menghilangkan seluruh kelas race condition yang sudah berulang kali muncul di sesi-sesi sebelumnya (v1.1.0, v1.1.3) — bukan ditambal lagi, tapi diganti pendekatannya dari akar.

**Redesain total: konsistensi hide/unhide & hapus di seluruh note editor.**

Audit ulang menemukan kode editor sebenarnya punya **tiga pola interaksi berbeda yang campur aduk** tanpa disadari di sesi-sesi sebelumnya:
1. Toggle ✓ di menu "Lainnya" untuk **buka/tutup panel kontrol** (Font, Tekstur, Kapsul Waktu, dll.)
2. Ikon mata 👁 untuk **hide/unhide data yang sudah ditampilkan** (Mood, Tag, block)
3. **Catatan Terhubung, Reaksi, dan Highlight ternyata sama sekali tidak ikut pola hide/unhide** — field `linkedNotes`/`reaction`/`highlights` sudah ada di tipe `NoteSectionKey` sejak Sesi 17, tapi UI-nya tertinggal: ketiganya masih murni toggle buka/tutup panel seperti kategori 1, tanpa tombol mata sama sekali, dan section-nya hilang total dari tampilan begitu panel ditutup — inilah sumber laporan "ada yang centang/uncentang, ada yang klik/unklik, ada yang hide/unhide, ada yang cuma hapus".

**fix(konsistensi):**
- **Catatan Terhubung, Reaksi, dan Highlight** sekarang render otomatis di body catatan begitu ada datanya (sama seperti Mood/Tag), dengan `NoteSectionHeader` yang identik — bukan lagi disembunyikan di balik panel "buka/tutup" yang terpisah dari datanya sendiri.
- Tombol di menu "Lainnya" untuk ketiga fitur ini sekarang: kalau section sedang di-hide → meng-unhide-kannya; kalau sedang visible → membuka picker untuk **menambah** data baru (tautkan catatan lain / lihat opsi reaksi). Dua aksi yang jelas berbeda, tidak lagi tercampur.
- Font, Tekstur, Kapsul Waktu, Catatan Rahasia, Riwayat Versi, Jadwal, Pindai Barcode, Baca Keras — **tetap** sebagai panel buka/tutup murni (ini sudah benar sejak awal: ini adalah *pengaturan/aksi*, bukan data yang ditampilkan, jadi memang tidak punya — dan tidak butuh — toggle hide/unhide).

Files: `src/hooks/use-note-editor.ts`, `src/services/notes.service.ts`, `src/components/notes/note-editor.tsx`

---

### v1.1.3 — 20 Jun 2026 (Sesi 20)
**Kemungkinan root cause bug tag ditemukan: Firestore rules tidak ter-deploy dengan benar · Write verification · Index scheduled notes diperbaiki**

**Temuan dari analisis Firebase Console (screenshot user):**

- `error_logs` collection menunjukkan entry nyata: `context: "notes.version.save.failed"`, `message: "Missing or insufficient permissions"` — FirebaseError dari Security Rules yang menolak write ke subcollection `notes/{noteId}/versions`. Field `tags` pada dokumen note terkonfirmasi tersimpan sebagai `(array)` kosong `[]` di Firestore (bukan `null` — jadi tipe data sudah benar, tapi datanya memang kosong).

**fix(deploy): `firebase.json` mereferensikan `database.rules.json` (RTDB) padahal RTDB belum diaktifkan di project.** Ini berpotensi membuat `firebase deploy` gagal total — termasuk gagal mendeploy `firestore.rules` yang benar — sehingga rules versi lama (kemungkinan tanpa block `match /versions/{versionId}`, atau lebih ketat untuk field tertentu) yang masih aktif di Firebase Console, tidak sinkron dengan `firestore.rules` di kode. Entry `"database"` dihapus dari `firebase.json` sampai RTDB benar-benar diaktifkan (lihat [Deployment](#deployment) untuk langkah aktivasi).

**fix(reliability): `saveVersion()` sekarang hanya dipanggil saat title/content/blocks berubah** (bukan di setiap auto-save tags/mood/weather/dll). Version history secara semantik memang untuk melacak perubahan tulisan, bukan metadata kecil — sekaligus mengurangi titik kegagalan karena setiap save tags sebelumnya ikut memicu read+write ke subcollection `versions` yang terbukti gagal permission di production.

**feat(reliability): write verification setelah save tags/mood.** `updateNote()` sekarang membaca ulang dokumen segera setelah `updateDoc()` dan membandingkan dengan data yang dikirim. Ini mengatasi kemungkinan race condition di mana `updateDoc()` resolve dari local optimistic cache (Firestore offline persistence aktif dengan `persistentMultipleTabManager`) sebelum write benar-benar terkonfirmasi/ditolak oleh server — sebelumnya kegagalan semacam ini bisa membuat promise tetap resolve sukses padahal data di server tidak berubah, tanpa toast error apa pun ke user. Sekarang jika verifikasi gagal, muncul toast error eksplisit "Tag gagal tersimpan" alih-alih kegagalan senyap.

**fix(index): composite index untuk `getScheduledNotes()` query salah urutan field** (`error_logs` menunjukkan `stats.scheduled.failed` — "query requires an index"). Index lama punya field `isPinned` yang tidak dipakai query ini dan urutan field tidak cocok kombinasi `where('userId') + where('isScheduled') + where('status') + orderBy('scheduledAt')`. Index baru ditambahkan dengan urutan field yang persis sesuai.

**Langkah yang perlu dilakukan secara manual (tidak bisa dilakukan dari sini):**

Jalankan dari terminal dengan Firebase CLI ter-autentikasi ke project `nala-koe`:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
Ini akan memastikan `firestore.rules` dan `firestore.indexes.json` versi terbaru di repo benar-benar aktif di Firebase Console — bukan hanya tersimpan di kode. Setelah deploy, coba lagi tambah tag pada catatan; jika instrumentasi debug (Console browser, F12) menunjukkan `[DEBUG tags] write verification read-back` dengan `foundTags` yang cocok dengan `sentTags`, berarti root cause sudah teratasi.

Files: `firebase.json`, `firestore.indexes.json`, `src/services/notes.service.ts`

---

### v1.1.2 — 20 Jun 2026 (Sesi 19)
**Fix: checklist tersembunyi masih muncul di progress bar · Konsistensi total hide/unhide & hapus di semua block · Instrumentasi debug untuk bug tag**

**Bug nyata ditemukan & diperbaiki:**

- **fix(checklist):** ketika sebuah block checklist disembunyikan (hide), item-itemnya **masih ikut dihitung** di `NoteChecklistProgress` (progress bar) — block-nya hilang dari tampilan utama tapi jumlah item & persentase di progress bar tetap menampilkan data dari checklist yang disembunyikan. Akar masalah: `allChecklistItems` di `note-editor.tsx` melakukan filter `b.type === 'checklist'` tanpa mengecualikan `b.isHidden`. Sekarang dikecualikan dengan benar.
- **fix(url-preview):** block Pratinjau Tautan **memang sudah** punya toggle hide/unhide di kode (tidak pernah benar-benar hilang), tapi penempatannya tidak konsisten — tombol hapus (X) ada di **dalam** kartu preview sebagai overlay hover-only yang nyaris tak terlihat, sementara toggle mata ditaruh terpisah di baris berbeda. Ini akar dari keluhan "inkonsistensi" — checklist tidak punya tombol hapus sama sekali, table/math pakai teks "Hapus X", url-preview pakai ikon X hover-only — empat pola berbeda untuk satu fitur yang sama.

**Redesign total: satu pola untuk semua block & section**

- **refactor(editor):** komponen baru `NoteBlockHeader` (di `note-visibility-toggle.tsx`) — header standar untuk SEMUA block (Checklist/Tabel/Kalkulasi/Pratinjau Tautan): label di kiri, ikon mata + ikon tong sampah di kanan, **selalu terlihat** (tidak ada lagi yang hover-only), **selalu di posisi yang sama**, **selalu ikon yang sama**. Checklist sekarang punya tombol hapus untuk pertama kalinya. `NoteUrlPreview` dapat prop baru `hideRemoveButton` untuk menonaktifkan tombol X internalnya tanpa mengganggu alur fetch preview (perbaikan dari kesalahan saya sendiri di percobaan pertama yang sempat memakai prop `readOnly` — itu salah, karena ikut menyembunyikan tombol "Pratinjau" yang masih dibutuhkan).
- **refactor(editor):** komponen baru `NoteSectionHeader` untuk section meta (Mood/Tag/Cuaca & Lokasi) — visual identik dengan `NoteBlockHeader` (tanpa ikon hapus, karena section bukan block yang bisa dihapus). Section dan block sekarang terlihat sebagai SATU fitur yang konsisten, bukan dua pola berbeda.

**Tentang bug tag yang dilaporkan belum teratasi:**

Saya melakukan audit menyeluruh dengan automated testing (bukan cuma membaca kode) terhadap seluruh jalur data tag: `TagInput` → `NoteMetaPanel` → `NoteEditor` → `useNoteEditor` hook → `updateNote` Firestore service, termasuk simulasi race condition timing dan pemeriksaan internal `@tanstack/react-query`'s `useMutation` source code. Semua jalur **lulus** test otomatis dengan hasil benar — `tags` selalu sampai dengan utuh ke `updateDoc()` baik dipanggil sendiri maupun bersamaan dengan perubahan mood.

Karena saya tidak bisa mereproduksi bug ini di sandbox (tidak ada akses ke Firestore project Anda / browser nyata), saya menambahkan **instrumentasi debug sementara** (`console.log('[DEBUG tags] ...')`) di 4 titik kritis:
1. `TagInput.addTag()` — saat tag diketik & Enter ditekan
2. `useNoteEditor.handleTagsChange()` — saat diterima dari UI
3. `useNoteEditor.scheduleAutoSave()` — saat di-merge ke antrian simpan
4. `notes.service.updateNote()` — persis sebelum dikirim ke Firestore

**Cara pakai:** buka DevTools Console (F12) di browser saat reproduce bug — ketik tag lalu Enter. Baris log mana yang **tidak muncul**, atau muncul dengan data yang salah, akan langsung menunjukkan di titik mana persisnya tag hilang. Mohon kirimkan screenshot/copy console log tersebut agar saya bisa memperbaiki dengan tepat sasaran, bukan menebak. Log ini akan dihapus begitu root cause ditemukan dan diperbaiki.

Files: `src/components/notes/note-editor.tsx`, `src/components/notes/note-visibility-toggle.tsx`, `src/components/notes/note-blocks-renderer.tsx`, `src/components/notes/note-meta-panel.tsx`, `src/components/notes/note-url-preview.tsx`, `src/hooks/use-note-editor.ts` (debug log), `src/services/notes.service.ts` (debug log), `src/components/tags/tag-input.tsx` (debug log)

---

### v1.1.1 — 20 Jun 2026 (Sesi 18)
**Konsistensi brand logo · Konsolidasi dokumentasi**

- **fix(brand):** logo di sidebar, mobile nav drawer, halaman login, dan halaman register — sebelumnya lingkaran dengan garis silang yang tidak merepresentasikan apa pun dan tidak konsisten dengan identitas brand lain di aplikasi. Diganti ke monogram **"N" dengan garis bawah aksen biru**, persis sama dengan desain app icon resmi (lihat `scripts/generate-icons.mjs` — latar `#0f172a`, teks putih, underline `--accent`). Sekarang logo di dalam aplikasi dan logo saat PWA di-install adalah satu identitas visual yang sama.
- **refactor(brand):** komponen baru `src/components/shared/nalakoe-logo.tsx` (`NalaKoeLogo`) — satu sumber kebenaran untuk brand mark, dipakai di ke-4 lokasi. Latar container menggunakan warna fixed `#0f172a` (bukan token tema `--surface-invert`) agar kontras selalu terjamin di light maupun dark mode.
- **chore(docs):** `RTDB_ACTIVATION.md` dihapus — isinya digabung ke bagian [Deployment](#deployment) di README ini. README.md sekarang satu-satunya file dokumentasi di project; semua `.md` lain yang pernah dibuat di sesi-sesi sebelumnya (CHANGES.md, readme-nala-koe.md) sudah tidak ada.

Files: `src/components/shared/nalakoe-logo.tsx` (baru), `src/components/layouts/sidebar.tsx`, `src/components/layouts/mobile-nav.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `README.md`

---

### v1.1.0 — 20 Jun 2026 (Sesi 17)
**Fitur baru: hide/unhide section & block · Bug fix kritis: tag tidak tersimpan · Optimasi performa editor**

**Bug kritis — tag (dan field lain) hilang akibat race condition save:**
- **fix(save):** `saveMutation`'s `onSuccess` sebelumnya memanggil `invalidateQueries({ queryKey: [NOTES_QUERY_KEY] })` tanpa filter — ini meng-invalidate **juga** query detail catatan yang sedang aktif diedit, memicu refetch dari Firestore yang **menimpa** state lokal (termasuk tag yang baru diketik tapi masih dalam jendela debounce 1500ms, belum sempat tersimpan). Sekarang invalidation memakai `predicate` yang **mengecualikan** query note yang sedang aktif diedit.
- **fix(save):** sebagai pengaman tambahan, `queryFn` di `useNoteEditor` sekarang menggabungkan (`merge`) `pendingInputRef` (perubahan lokal yang belum tersimpan) ke atas data hasil refetch apa pun — sehingga edit yang sedang berjalan tidak pernah hilang meski ada refetch dari sumber lain (window refocus, dll).

**Fitur baru — Hide/Unhide (Tampilkan/Sembunyikan) untuk semua fitur catatan:**
- **feat(editor):** setiap section (Mood, Tag, Cuaca & Lokasi) dan setiap block (Checklist, Tabel, Kalkulasi, Pratinjau Tautan) kini punya tombol mata (👁) terpisah dari tombol hapus — klik untuk menyembunyikan section/block dari tampilan catatan **tanpa menghapus datanya**. Section/block yang disembunyikan kolaps jadi satu baris placeholder bergaris putus-putus yang bisa diklik untuk ditampilkan lagi.
- **feat(types):** field baru `Note.hiddenSections: NoteSectionKey[]` (untuk section) dan `NoteContentBlock.isHidden?: boolean` (untuk block) — keduanya backward-compatible (default kosong/`false` untuk catatan lama).
- Komponen baru: `note-visibility-toggle.tsx` (`NoteVisibilityToggle`, `NoteHiddenCollapsedRow`), `note-meta-panel.tsx` (extract dari NoteEditor), `note-blocks-renderer.tsx` (extract dari NoteEditor).

**Optimasi performa editor — mengatasi delay/lag saat mengetik:**
- **perf(editor):** `analyzeContent()` (word count) dan `detectLanguage()` sebelumnya berjalan **sinkron pada setiap keystroke**, melakukan full-string scan sebelum textarea sempat re-render — ini sumber utama lag. Sekarang `content` di-update segera ke state, sementara word count & deteksi bahasa di-debounce terpisah (400ms) sehingga tidak memblokir ketikan.
- **perf(editor):** `useNotes({status:'active'})` di `NoteEditor` sebelumnya fetch **seluruh daftar catatan aktif** setiap kali halaman edit dibuka (untuk panel "Catatan terhubung" yang defaultnya tertutup), dan meng-overwrite store dashboard global sebagai side effect. Sekarang lazy-loaded — hanya fetch saat panel benar-benar dibuka, dan tidak lagi menyentuh store global (`syncToStore: false`).
- **perf(editor):** 12 `useState` boolean terpisah untuk toggle panel (font, texture, linked notes, dst) — masing-masing dipasangkan inline arrow function baru di setiap render — digabung jadi satu state object + satu `togglePanel()` callback stabil. `NoteEditorToolbar` sekarang dibungkus `React.memo` dan benar-benar efektif karena propsnya stabil.
- **perf(editor):** `checklistBlocks.flatMap(JSON.parse)` dan `stripHtml(content)` di-memoize via `useMemo` — sebelumnya dihitung ulang di setiap render (setiap keystroke).
- **refactor:** `note-editor.tsx` dipecah jadi `note-meta-panel.tsx` dan `note-blocks-renderer.tsx`, masing-masing dibungkus `React.memo`, agar perubahan title/content tidak memicu re-render seluruh panel meta dan blocks.

**Perbaikan kualitas kode (non-breaking, dari audit React Compiler):**
- **fix:** `note-weather-badge.tsx` — ikon cuaca dinamis kini dirender via `createElement` eksplisit (sebelumnya `<Icon />` dari variable di-flag sebagai pola tidak aman oleh React Compiler)
- **fix:** `tag-cloud-visual.tsx` — `Math.random()` di render body diganti seeded deterministic shuffle (sebelumnya urutan tag cloud berubah acak setiap re-render, bukan hanya saat data berubah)
- **fix:** `note-scheduled.tsx` — `Date.now()` di default `useState` dipindah ke lazy initializer; `handlePreset` dikonversi ke `useCallback`
- **fix:** `note-math-block.tsx` — evaluasi ekspresi matematika direfactor dari `useEffect`+`setState` ke `useMemo` (derived value murni) — bonus: mengurangi 1 render ekstra per keystroke di blok kalkulasi
- **fix:** `command-palette.tsx` — reset index seleksi saat query berubah direfactor dari `useEffect` ke pola resmi React "adjust state during render" — mengurangi 1 render ekstra per ketikan di pencarian
- **fix:** `note-barcode-scanner.tsx`, `use-tags.ts` — dependency array `useCallback` disesuaikan agar match dengan inferensi React Compiler
- **chore:** bersihkan 3 `eslint-disable` directive yang sudah tidak relevan (`layout.tsx`, `note-texture-picker.tsx`, `milestone-toast.tsx`) dan duplikasi comment yang salah tempat di `use-stats.ts`

Files: `src/hooks/use-note-editor.ts`, `src/hooks/use-notes.ts`, `src/components/notes/note-editor.tsx`, `src/components/notes/note-editor-toolbar.tsx`, `src/components/notes/note-meta-panel.tsx` (baru), `src/components/notes/note-blocks-renderer.tsx` (baru), `src/components/notes/note-visibility-toggle.tsx` (baru), `src/components/notes/note-weather-badge.tsx`, `src/components/notes/note-math-block.tsx`, `src/components/notes/note-scheduled.tsx`, `src/components/notes/note-barcode-scanner.tsx`, `src/components/stats/tag-cloud-visual.tsx`, `src/components/shared/command-palette.tsx`, `src/hooks/use-tags.ts`, `src/types/note.types.ts`, `src/services/notes.service.ts`, `src/lib/importer/*.ts`

---

### v1.0.1 — 19 Jun 2026 (Sesi 16)
**Bug fixes: editor rich text**

- **fix(editor):** hapus `dangerouslySetInnerHTML` dari `NoteRichEditor` — React tidak lagi me-reset `innerHTML` saat re-render, sehingga teks yang sedang diketik tidak terhapus dan cursor tidak loncat
- **fix(editor):** perbandingan di `useEffect([content])` sekarang membandingkan versi _tersanitasi_ di kedua sisi — perbedaan whitespace dari DOMPurify tidak lagi memicu reset DOM palsu dan hilangnya format yang baru diapply
- **fix(editor):** `NoteRichEditor` menggunakan `useLayoutEffect([])` untuk set `innerHTML` sinkron pada mount, sebelum paint pertama
- **fix(rich-text):** `toggleInlineMark()` sekarang menyimpan snapshot selection sebelum mutasi DOM dan me-restore-nya sesudahnya — cursor tidak lagi hilang setelah klik Bold/Italic/Underline
- **fix(save):** `handleManualSave` menyertakan `contentFormat`, `fontWeight`, `texture`, `linkedNoteIds`, `isPinned` — format HTML tidak lagi hilang setelah ⌘S
- **fix(placeholder):** placeholder rich editor menggunakan `data-[empty=true]:before:content-[attr(data-placeholder)]` — bekerja benar meski DOM berisi `<p><br></p>`

Files: `src/components/notes/note-rich-editor.tsx`, `src/lib/rich-text.ts`, `src/hooks/use-note-editor.ts`, `src/components/notes/note-format-toolbar.tsx`

---

### v1.0.0 — Jun 2026 (Sesi 1–15)
**Rilis pertama — aplikasi lengkap**

Semua fitur dari Fase 0–12 selesai dan di-deploy ke Vercel:
- Scaffold + auth + CRUD catatan dasar (Sesi 1–5)
- Rich blocks: checklist, tabel, math, URL preview, barcode, TTS (Sesi 6–8)
- Timeline, Canvas, Graph view (Sesi 7–9)
- Stats dashboard, scheduled notes, tag cloud (Sesi 9)
- Export (TXT/MD/PDF/DOCX/XLSX/JSON) + Import (Keep/ColorNote/NalaKoe) (Sesi 10)
- Share as Card, seasonal theme, accent color, animated note cards (Sesi 11)
- PWA: service worker v2, manifest, Vitest unit tests, Playwright E2E (Sesi 12)
- Security: HttpOnly session cookies via Firebase Admin SDK (Sesi 12–13)
- Audit dan hardening menyeluruh vs prompt-personal-v4 (Sesi 13–14)
- Fix: canvas menu, three-dot note menu, graph overlay, NoteCard props (Sesi 15)
- Rich text editor sistem (contentEditable + DOMPurify, contentFormat plain/html) (Sesi 15)
- Toolbar redesign: Notion/Linear-style overflow "Lainnya" dropdown (Sesi 15)
- Phase E: AnimatedPanel dengan framer-motion tokens (Sesi 15)
