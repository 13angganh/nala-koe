# NalaKoe 📓

> *Nala* (Jawa/Sanskerta: pikiran, hati nurani) + *Koe* (milikku) — catatan pribadimu yang hidup dan bernapas.

**v1.0.1** · Next.js 16 · React 19 · Firebase · PWA

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

---

## Changelog

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
