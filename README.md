# NalaKoe 📓

> *Nala* (Jawa/Sanskerta: pikiran, hati nurani) + *Koe* (milikku) — catatan pribadimu yang hidup dan bernapas.

**v1.1.1** · Next.js 16 · React 19 · Firebase · PWA

---

## Deskripsi

NalaKoe adalah aplikasi jurnal/catatan personal mobile-first berbasis Next.js App Router + Firebase Firestore. Dibangun sebagai PWA yang bisa diinstall di HP, dengan fitur lengkap: mood tracking, rich text editor, canvas sticky notes, timeline, stats dashboard, export/import, dan banyak lagi.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
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

Lihat `.env.example` untuk semua variabel yang diperlukan. Jangan commit `.env.local`.

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
