# NalaKoe — Master Development Tracker
> Catatan pribadi yang hidup, bernapas, dan punya jiwa.

---

## Identitas Aplikasi

| Key | Value |
|-----|-------|
| **Nama** | NalaKoe |
| **Tagline** | Catatan pribadimu yang hidup dan bernapas |
| **Stack** | Next.js 15 (App Router) · TypeScript Strict · Tailwind CSS · Firebase · Radix UI |
| **Deploy** | Vercel via GitHub (auto-deploy, hanya di sesi final) |
| **Type** | PWA — Hybrid (Offline + Firebase) |
| **Token Version** | 1.0.0 |
| **Status** | 🟢 Audit Fix v4 (Sesi 14) — **0 Temuan — SIAP DEPLOY VERCEL** |

---

## Filosofi & DNA Aplikasi

**NalaKoe** berasal dari kata **Nala** (Jawa/Sansekerta: pikiran, nurani, hati) + **Koe** (dialek Indonesia: milikku). Artinya secara keseluruhan: *"Pikiran dan nuraniku."*

Ini bukan sekadar app catatan. NalaKoe adalah **ruang pribadi yang hidup** — setiap catatan punya emosi, konteks, usia, dan reaksi. Catatan bukan hanya teks statis, melainkan rekam jejak pikiran yang bernapas seiring waktu.

**Inspirasi desain:** Linear, Vercel, Notion, Raycast — clean, premium, purposeful.

---

## Feature List Final (Semua yang Disepakati)

### 🧠 Core & Emosional
| # | Fitur | Keterangan |
|---|-------|------------|
| 1 | **Mood Catatan** | Pilih mood saat simpan. Filter by mood. Insight bulanan |
| 2 | **Time Capsule Note** | Catatan dikunci, baru terbuka di tanggal tertentu. Countdown timer |
| 5 | **Smart Folder** | Auto-grouping berdasarkan pola penulisan, kata kunci, waktu |
| 6 | **Canvas Mode** | Sticky note bebas di papan virtual. Dynamic import wajib |
| 8 | **Gradasi Warna Dinamis** | Warna card berubah berdasarkan waktu pembuatan (pagi/malam) |
| 17 | **Note Reaction** | Reaksi ke catatan lama: "Setuju", "Tidak relevan", "Follow up" |

### 📊 Insight & Statistik
| # | Fitur | Keterangan |
|---|-------|------------|
| 13 | **Writing Stats Dashboard** | Kata/minggu, jam produktif, streak, catatan terpanjang |
| 32 | **Scheduled Note** | Tulis sekarang, muncul di feed waktu tertentu |
| 33 | **Tag Cloud Visual** | Word cloud interaktif. Tag besar = sering dipakai |
| 34 | **Note Journey Timeline** | View horizontal berdasarkan tanggal. Scroll kiri = masa lalu |
| 36 | **Streak + Milestone** | Gamifikasi ringan. Milestone unlock tema eksklusif |
| 38 | **Search by Mood/Konteks** | Filter: mood + waktu + jenis konten. Terintegrasi Command Palette |
| 39 | **Highlight & Bookmark** | Highlight bagian catatan. Lihat semua highlight di satu halaman |

### ✍️ Input & Format
| # | Fitur | Keterangan |
|---|-------|------------|
| 41 | **Table Note** | Insert tabel ringan dalam catatan |
| 42 | **Math Note** | `15% dari 200.000=` langsung kalkulasi inline |
| 43 | **Checklist + Progress Bar** | Progress bar visual di card. "3/7 selesai" |
| 44 | **Multi-format** | Campur teks + checklist + gambar + tabel + audio dalam 1 catatan |
| 49 | **Read Aloud** | Text-to-speech native. Pilih kecepatan & suara |
| 50 | **Word Count + Reading Time** | Tampil di setiap catatan |

### 🌍 Konteks & Metadata
| # | Fitur | Keterangan |
|---|-------|------------|
| 20 | **Note in Context** | Auto-simpan lokasi (opsional) + waktu saat catatan dibuat |
| 45 | **Weather Snapshot** | Auto-simpan cuaca saat catatan dibuat via Open-Meteo API |
| 46 | **Note dari URL** | Paste link → auto-extract judul + thumbnail + deskripsi |
| 47 | **Barcode/QR Scanner** | Scan barcode produk → simpan info sebagai catatan |
| 48 | **Multilingual Auto-Detect** | Deteksi bahasa otomatis. Label + filter by bahasa |

### 🗂️ Organisasi & Manajemen
| # | Fitur | Keterangan |
|---|-------|------------|
| 11 | **Linked Notes + Graph** | `[[judul]]` syntax. Graph visualisasi opsional (dynamic import) |
| 26 | **Recycle Bin + Restore Preview** | Preview konten tanpa restore dulu |
| 27 | **Version History** | Max 10 snapshot per catatan. Lihat diff & restore |
| 28 | **Pinned + Prioritas Visual** | Badge + card lebih besar untuk prioritas tinggi |
| 51 | **Archive vs Delete (3 lapisan)** | Aktif → Arsip → Sampah (30 hari) |
| 52 | **Duplicate Note** | Salin catatan 1 tap |
| 53 | **Merge Notes** | Gabung 2+ catatan. Wajib ConfirmDialog |
| 54 | **Note Size Indicator** | Badge berat catatan (foto + audio + teks panjang) |

### 🎨 Visual & Estetika
| # | Fitur | Keterangan |
|---|-------|------------|
| 24 | **Font Mood** | Variasi weight/style Inter per catatan (regular/medium/semibold/italic) |
| 57 | **Seasonal Theme Otomatis** | Tema berubah otomatis: Ramadan, Lebaran, Tahun Baru. Dari tokens |
| 58 | **Note Paper Texture** | Background: polos, bergaris, dot grid, kotak-kotak |
| 59 | **Dark/Light/Auto + Custom Accent** | Override CSS variable `--brand-*`. Simpan ke localStorage |
| 60 | **Animated Note Card** | Micro-animation saat buka catatan. Ikut `animation.ts` tokens |

### 🔐 Keamanan & Privacy
| # | Fitur | Keterangan |
|---|-------|------------|
| 29 | **Secret Note + Biometrik** | Web Authentication API. Fallback PIN. Card tampil sebagai 🔒 |
| 30 | **Offline Badge** | Indikator sync status tiap catatan. Dari `use-network-status.ts` |

### 📤 Export & Import
| # | Fitur | Keterangan |
|---|-------|------------|
| 64 | **Export Multi-format** | TXT, Markdown, PDF, DOCX, XLSX. Bulk export semua catatan |
| 65 | **Import dari Keep/ColorNote** | Parser `.json` Keep & ColorNote. Tanggal asli dipertahankan di `originalCreatedAt` |
| 66 | **Backup ke Google Drive** | Manual export JSON. User simpan sendiri ke Drive |

---

## Tech Stack Detail

```
Framework      : Next.js 15 (Full App Router — NO Pages Router)
Language       : TypeScript strict mode
Styling        : Tailwind CSS + Custom Design Tokens (CSS Custom Properties)
Components     : Radix UI primitives (Button, Dialog, Tooltip, Switch, Tabs, Avatar, dll)
Icons          : Lucide React — NO emoji di UI
State          : Zustand + TypeScript generics
Data Fetching  : TanStack Query (React Query) + Server Components
Forms          : React Hook Form + Zod resolver
Validation     : Zod (form, API response, env variables)
Backend        : Firebase (Firestore, Auth, Storage)
Auth           : Firebase Auth
Animation      : Tailwind transitions + Framer Motion
Toast          : Sonner
Monitoring     : Sentry
Testing        : Vitest + React Testing Library + Playwright
Deploy         : Vercel via GitHub
Fonts          : Inter (UI) + JetBrains Mono (kode, ID, timestamp)
```

> **Catatan:** shadcn/ui diganti Radix UI primitives langsung. Komponen ditulis sendiri di `components/ui/` agar lebih kontrol dan tidak ada dependency conflict.

---

## Design System

```
Brand Color    : #0ea5e9 (sky-500) — dipakai hemat, bukan dekoratif
Surface Light  : #ffffff / #f8fafc / #f1f5f9 / #e2e8f0
Surface Dark   : #0f172a / #1e293b / #334155 / #475569
Text Light     : #0f172a / #475569 / #94a3b8
Text Dark      : #f8fafc / #cbd5e1 / #64748b
Border Light   : #e2e8f0 / #cbd5e1
Border Dark    : #334155 / #475569
Base Unit      : 4px
Border Radius  : 2px / 4px / 6px / 8px / 12px / 16px / 24px
Touch Target   : Minimum 36px. CTA minimum 40px
Kontras        : Min 4.5:1 teks normal, 3:1 teks besar & UI
```

**Arsitektur styling:** Semua token warna berjalan sebagai CSS Custom Properties (`--accent`, `--surface-base`, dll) di `globals.css`. Komponen menggunakan `bg-[var(--surface-subtle)]` bukan `bg-slate-50 dark:bg-slate-900` — ini memungkinkan runtime theme switching tanpa rehydration flicker.

---

## Struktur Folder

```
nalakoe/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx               ✅ Login form + Google OAuth
│   │   │   │   └── loading.tsx            ✅
│   │   │   └── register/
│   │   │       └── page.tsx               ✅ Register form + Google OAuth
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                 ✅ Auth guard + Header + Sidebar + CommandPalette
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx               ✅ Greeting + quick links
│   │   │   │   └── loading.tsx            ✅
│   │   │   ├── notes/
│   │   │   │   ├── page.tsx               ✅ Note list + filter + search
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx           ✅ Note editor full (Phase 2–6)
│   │   │   ├── canvas/
│   │   │   │   └── page.tsx               ✅ Infinite canvas + sticky notes (Phase 5)
│   │   │   ├── timeline/
│   │   │   │   └── page.tsx               ✅ Timeline horizontal per bulan (Phase 5)
│   │   │   ├── graph/
│   │   │   │   └── page.tsx               ✅ Force-directed graph catatan (Phase 5)
│   │   │   ├── stats/
│   │   │   │   └── page.tsx               ⬜ placeholder
│   │   │   ├── highlights/
│   │   │   │   └── page.tsx               ✅ Highlights page (Phase 8)
│   │   │   ├── archive/
│   │   │   │   └── page.tsx               ⬜ placeholder
│   │   │   └── trash/
│   │   │       └── page.tsx               ✅ Trash + restore preview (Phase 7)
│   │   ├── api/
│   │   │   └── url-meta/
│   │   │       └── route.ts               ✅ OG metadata extractor
│   │   ├── layout.tsx                     ✅ Root layout + providers
│   │   ├── globals.css                    ✅ Design tokens + dark mode
│   │   └── page.tsx                       ✅ Redirect ke /dashboard
│   ├── components/
│   │   ├── ui/                            ✅ Button, Input, Badge, Dialog, dll
│   │   ├── shared/                        ✅ EmptyState, LoadingSpinner, ConfirmDialog, dll
│   │   ├── layouts/                       ✅ Sidebar, Header, CommandPalette
│   │   ├── notes/                         ✅ NoteCard, NoteEditor, Toolbar, dll (Phase 2–6)
│   │   │   ├── note-card.tsx              ✅ (Phase 6: preview secret/capsule)
│   │   │   ├── note-editor.tsx            ✅ (Phase 6: 3 panel baru)
│   │   │   ├── note-editor-toolbar.tsx    ✅ (Phase 6: 3 tombol baru)
│   │   │   ├── note-time-capsule-lock.tsx ✅ (Phase 6)
│   │   │   ├── note-secret-lock.tsx       ✅ (Phase 6)
│   │   │   ├── note-version-history.tsx   ✅ (Phase 6)
│   │   │   └── note-offline-badge.tsx     ✅ (Phase 6)
│   │   ├── tags/                          ✅ TagBadge, TagInput, TagCloud
│   │   ├── timeline/                      ✅ TimelineView, TimelineItem (Phase 5)
│   │   ├── canvas/                        ✅ CanvasBoard, CanvasSticky (Phase 5)
│   │   └── graph/                         ✅ GraphView (Phase 5)
│   ├── services/
│   │   ├── notes.service.ts               ✅ CRUD + linkedNoteIds + saveVersion + getNoteVersions
│   │   ├── canvas.service.ts              ✅ Board + sticky CRUD (Phase 5)
│   │   ├── mood.service.ts                ✅
│   │   ├── tags.service.ts                ✅
│   │   ├── export.service.ts              ✅ Export 6 format (Phase 10)
│   │   └── import.service.ts              ✅ Batch Firestore import (Phase 10)
│   ├── hooks/
│   │   ├── use-notes.ts                   ✅
│   │   ├── use-note-editor.ts             ✅ (Phase 6: handleTimeCapsuleChange, handleSecretChange)
│   │   ├── use-auth.ts                    ✅
│   │   ├── use-mood.ts                    ✅
│   │   ├── use-tags.ts                    ✅
│   │   ├── use-weather.ts                 ✅
│   │   ├── use-geolocation.ts             ✅
│   │   ├── use-url-meta.ts                ✅
│   │   ├── use-barcode-scanner.ts         ✅
│   │   ├── use-read-aloud.ts              ✅
│   │   ├── use-confirm-dialog.ts          ✅
│   │   ├── use-network-status.ts          ✅
│   │   ├── use-time-capsule.ts            ✅ (Phase 6)
│   │   ├── use-biometric.ts               ✅ (Phase 6)
│   │   └── use-version-history.ts         ✅ (Phase 6)
│   ├── types/
│   │   ├── note.types.ts                  ✅ NoteListItem + linkedNoteIds (Phase 5)
│   │   ├── canvas.types.ts                ✅ CanvasBoard, CanvasSticky
│   │   └── api.types.ts                   ✅
│   ├── stores/
│   │   ├── auth.store.ts                  ✅
│   │   └── notes.store.ts                 ✅
│   ├── lib/
│   │   ├── firebase.ts                    ✅
│   │   ├── format.ts                      ✅
│   │   ├── logger.ts                      ✅
│   │   ├── normalizer.ts                  ✅
│   │   ├── math-parser.ts                 ✅
│   │   ├── language-detector.ts           ✅
│   │   └── color-gradient.ts              ✅
│   ├── schemas/
│   │   ├── note.schema.ts                 ✅
│   │   └── tag.schema.ts                  ✅
│   └── constants/
│       ├── routes.ts                      ✅
│       ├── config.ts                      ✅
│       ├── moods.ts                       ✅
│       ├── seasonal.ts                    ✅
│       └── z-index.ts                     ✅
```

---

## Progress Checklist Per Phase

### Phase 0 — Setup & Foundation ✅ SELESAI
- [x] Next.js 15 + TypeScript strict
- [x] Tailwind + design tokens (CSS Custom Properties)
- [x] Firebase setup (Auth, Firestore, Storage)
- [x] Zustand store
- [x] TanStack Query provider
- [x] Semua komponen UI dasar (`components/ui/`)
- [x] `globals.css` — token warna + dark mode
- [x] `middleware.ts` — route protection

### Phase 1 — Auth & Layout ✅ SELESAI
- [x] Login + Register form (email/password + Google OAuth)
- [x] Auth guard di layout protected
- [x] Sidebar navigasi + Header
- [x] Command Palette (`Cmd+K`)
- [x] Dashboard page (greeting + quick links)

### Phase 2 — Note Core (CRUD) ✅ SELESAI
- [x] `services/notes.service.ts` — full CRUD
- [x] `hooks/use-notes.ts` — list, create, trash, restore, delete
- [x] Note list page + filter + search
- [x] Note editor page (`notes/[id]`)
- [x] `components/notes/note-card.tsx`
- [x] `components/notes/note-editor.tsx`
- [x] `components/notes/note-editor-toolbar.tsx`

### Phase 3 — Mood, Tag & Metadata ✅ SELESAI
- [x] `services/mood.service.ts`
- [x] `services/tags.service.ts`
- [x] `hooks/use-mood.ts`, `use-tags.ts`, `use-weather.ts`, `use-geolocation.ts`
- [x] `lib/language-detector.ts`, `lib/color-gradient.ts`
- [x] `components/notes/note-mood-picker.tsx`
- [x] `components/notes/note-weather-badge.tsx`
- [x] `components/tags/tag-badge.tsx`, `tag-input.tsx`, `tag-cloud.tsx`
- [x] Multilingual auto-detect + label
- [x] Gradasi warna dinamis (6 periode)
- [x] Weather snapshot via Open-Meteo API
- [x] Lokasi metadata (opsional, dengan permission)

### Phase 4 — Note Lanjutan (Rich Features) ✅ SELESAI
> **Hasil:** Table, Math inline, URL preview, Font mood, Texture, Linked notes, Barcode scanner, Read aloud

- [x] `lib/math-parser.ts` — safe evaluator, shorthand "X% dari Y", format id-ID
- [x] `hooks/use-url-meta.ts` — fetch /api/url-meta, timeout 10s
- [x] `hooks/use-barcode-scanner.ts` — BarcodeDetector API, polling 20 frame
- [x] `hooks/use-read-aloud.ts` — SpeechSynthesis, rate 0.5–3×, progress live
- [x] `components/notes/note-table.tsx` — editable, tambah/hapus baris & kolom
- [x] `components/notes/note-math-block.tsx` — evaluasi live saat diketik
- [x] `components/notes/note-url-preview.tsx` — card preview: favicon, og:image, title, desc
- [x] `components/notes/note-font-picker.tsx` — 4 gaya + helper fontWeightClass()
- [x] `components/notes/note-texture-picker.tsx` — 4 tekstur + SVG preview + textureClass()
- [x] `components/notes/note-linked-notes.tsx` — picker dropdown search + chip
- [x] `components/notes/note-barcode-scanner.tsx` — variant trigger & inline, copy result
- [x] `components/notes/note-read-aloud.tsx` — progress bar, settings panel
- [x] `app/api/url-meta/route.ts` — GET handler metadata OG, blokir private IP, cache 1 jam
- [x] `note-editor-toolbar.tsx` diperbarui — 8 tombol baru + scrollable horizontal
- [x] `note-editor.tsx` diperbarui — 5 panel baru, 3 block type baru, URL prompt bar
- [x] `use-note-editor.ts` diperbarui — 6 handler baru Phase 4
- [x] `notes/[id]/page.tsx` diperbarui — forward semua prop Phase 4
- [x] Unit tests: math-parser (30 kasus), note-table, appearance helpers, use-url-meta, use-barcode-scanner, use-read-aloud

### Phase 5 — Timeline, Canvas & Graph ✅ SELESAI
> **Hasil:** Timeline scroll horizontal per bulan, infinite canvas sticky notes, force-directed graph

- [x] `types/note.types.ts` — tambah `linkedNoteIds` ke `NoteListItem`
- [x] `services/notes.service.ts` — `toNoteListItem()` include `linkedNoteIds`
- [x] `hooks/use-notes.ts` — `addNote` mutation include `linkedNoteIds`
- [x] `services/canvas.service.ts` — CRUD Firestore `canvas_boards` + `canvas_stickies`, batch update posisi
- [x] `components/timeline/timeline-view.tsx` — scroll horizontal, group per bulan, card per note
- [x] `components/timeline/timeline-item.tsx` — item dengan mood badge, tag, word count
- [x] `components/canvas/canvas-sticky.tsx` — draggable, edit inline, color picker (7 warna), delete
- [x] `components/canvas/canvas-board.tsx` — infinite canvas, pan (drag), zoom (scroll/tombol), dot-grid, viewport persist
- [x] `components/graph/graph-view.tsx` — force-directed graph via Canvas API (tanpa d3), pan+zoom, klik node buka note
- [x] `app/(protected)/timeline/page.tsx` — full implementation
- [x] `app/(protected)/canvas/page.tsx` — dynamic import CanvasBoard, load board dari Firestore
- [x] `app/(protected)/graph/page.tsx` — dynamic import GraphView, load semua notes aktif

### Phase 6 — Time Capsule, Secret Note, Version History & Offline Badge ✅ SELESAI
> **Hasil:** Kapsul waktu dengan countdown, kunci rahasia PIN + biometrik, riwayat versi dengan diff viewer, badge offline per catatan

- [x] `hooks/use-time-capsule.ts` — status locked/unlocked, countdown real-time, validasi tanggal (min 1 hari, maks 10 tahun)
- [x] `hooks/use-biometric.ts` — Web Authentication API: register + verify platform credential, fallback jika tidak supported
- [x] `hooks/use-version-history.ts` — load Firestore subcollection versions, restore versi, diffText line-level, formatVersionLabel
- [x] `services/notes-version.service.ts` — terintegrasi di `notes.service.ts` (saveVersion + getNoteVersions)
- [x] `components/notes/note-time-capsule-lock.tsx` — 6 preset + date picker, countdown live (hh:mm:ss), ConfirmDialog hapus
- [x] `components/notes/note-secret-lock.tsx` — PIN 6 digit + Web Authn biometrik, locked/unlocked state, hapus kunci
- [x] `components/notes/note-version-history.tsx` — accordion, diff viewer (added/removed/unchanged), restore dengan ConfirmDialog
- [x] `components/notes/note-offline-badge.tsx` — badge adaptive: offline/saving/dirty/saved + waktu relatif
- [x] Web Authentication API untuk biometrik (platform authenticator, credential per noteId)
- [x] Fallback PIN protection (6 digit, hash localStorage per noteId)
- [x] `note-editor-toolbar.tsx` diperbarui — 3 tombol Phase 6 (Timer, Lock, History)
- [x] `note-editor.tsx` diperbarui — 3 panel Phase 6 + 5 props baru
- [x] `note-card.tsx` diperbarui — preview berbeda: secret → "Konten terenkripsi", capsule locked → countdown
- [x] `notes/[id]/page.tsx` diperbarui — forward props Phase 6
- [x] `hooks/use-note-editor.ts` diperbarui — `handleTimeCapsuleChange`, `handleSecretChange`
- [x] Unit tests: use-time-capsule (7 kasus), use-version-history/diffText (7 kasus)

### Phase 7 — Organisasi & Manajemen Lanjutan ✅ SELESAI
> **Hasil:** Archive 3-layer, recycle bin preview, duplicate, merge dengan ConfirmDialog, pinned priority badge, note size indicator, smart folder 7 kategori
- [x] Archive system (3 lapisan: aktif → arsip → sampah)
- [x] `services/notes.service.ts` — +`archiveNote`, `duplicateNote`, `mergeNotes`, `getNoteSizeInfo`
- [x] `hooks/use-smart-folder.ts` — 7 smart folder kategori, client-side filter
- [x] `hooks/use-merge-notes.ts` — mutation merge + selectedIds state
- [x] `hooks/use-notes.ts` — +`useArchiveNote`, `useDuplicateNote`
- [x] Recycle bin + restore preview — `app/(protected)/trash/page.tsx` full implementation
- [x] Duplicate note — `useDuplicateNote` + `duplicateNote` service
- [x] Merge notes — `NoteMergeDialog` + `useMergeNotes`, ConfirmDialog wajib
- [x] Pinned + prioritas visual — `NotePriorityBadge`, card styling, dropdown aksi
- [x] Note size indicator — `NoteSizeIndicator` + `NoteSizeBadge`, estimasi bytes
- [x] Smart folder (auto-grouping) — `SmartFolderPanel`, 7 kategori, toggle dari notes page

### Phase 8 — Reactions, Highlights & Streak ✅ SELESAI
> **Hasil:** Reaksi 3 jenis per catatan, highlight teks dengan offset, halaman highlights terpusat, streak tracker + milestone toast dengan confetti canvas-native

- [x] `services/reactions.service.ts` — setNoteReaction, clearNoteReaction
- [x] `services/highlights.service.ts` — addHighlight, removeHighlight, getAllHighlights (validasi overlap)
- [x] `hooks/use-streak.ts` — currentStreak, longestStreak, totalActiveDays, todayHasNote, milestoneReached (6 milestone)
- [x] `components/notes/note-reaction-bar.tsx` — 3 reaksi: Setuju/Tidak Relevan/Follow Up, toggle, loading state
- [x] `components/notes/note-highlight-marker.tsx` — Pilih teks → highlight, hover → delete, TreeWalker offset
- [x] `components/notes/streak-card.tsx` — Stats 3 kolom + mini calendar 7 hari + badge status hari ini
- [x] `app/(protected)/highlights/page.tsx` — Implementasi penuh: grouped by note, delete confirm, empty state
- [x] `components/shared/milestone-toast.tsx` — Toast milestone + confetti canvas-native, 6 config milestone
- [x] Dashboard: StreakCard + milestone toast trigger via useEffect + useRef

### Phase 9 — Stats Dashboard, Scheduled Note & Tag Cloud ✅ SELESAI
> **Hasil:** Stats dashboard 6 tab (ringkasan/aktivitas/streak/mood/tag cloud/terjadwal), scheduled note dengan 4 preset + datetime picker, tag cloud interaktif dengan filter, activity heatmap 30 hari, milestone streak dengan progress bar

- [x] `services/stats.service.ts` — 6 fungsi Firestore: `getWritingStats` (total, kata, streak, jam produktif), `getMoodInsights` (frekuensi+%), `getMonthlyStats` (N bulan, activeDays), `getWeeklyActivity` (heatmap harian), `getTagFrequency` (sorted), `getScheduledNotes` (filter isScheduled)
- [x] `hooks/use-stats.ts` — 6 React Query hooks: `useWritingStats`, `useMoodInsights`, `useMonthlyStats`, `useWeeklyActivity`, `useTagFrequency`, `useScheduledNotes`. staleTime 5 menit
- [x] `components/stats/stats-overview.tsx` — Grid 6 StatCard: total catatan, total kata, kata minggu ini, streak saat ini (accent jika ≥3), streak terpanjang, jam paling produktif
- [x] `components/stats/stats-mood-chart.tsx` — Horizontal bar chart, lebar relatif terhadap mood terbanyak, warna dari MOOD_MAP, label + count×%
- [x] `components/stats/stats-writing-chart.tsx` — `StatsMonthlyChart`: bar per bulan, toggle Catatan/Kata, bar bulan ini accent, tooltip hover. `StatsActivityHeatmap`: grid 30 kotak, 4 level opacity, legend
- [x] `components/stats/stats-streak-card.tsx` — 3 stat (current/rekor/total catatan) + progress bar ke milestone berikutnya + 6 chip milestone (filled jika dicapai)
- [x] `components/stats/tag-cloud-visual.tsx` — Word cloud interaktif, 5 ukuran font (text-xs → text-2xl), opacity proporsional, tag di-shuffle, klik → filter notes page
- [x] `components/stats/scheduled-notes-panel.tsx` — List upcoming/past, badge warna: accent (normal), warning (≤1 hari), muted (sudah lewat), link ke note editor
- [x] `components/stats/index.ts` — Barrel export
- [x] `components/notes/note-scheduled.tsx` — Panel jadwal: state inactive = 4 preset (Besok pagi/Lusa/1 minggu/1 bulan) + datetime picker; state active = tampil jadwal + ubah waktu + hapus (ConfirmDialog)
- [x] `app/(protected)/stats/page.tsx` — Implementasi penuh: 6 tab, toggle Catatan/Kata di tab Aktivitas, badge count di tab Terjadwal
- [x] `note-editor-toolbar.tsx` — +tombol CalendarClock Phase 9, badge accent jika `isScheduledActive`
- [x] `note-editor.tsx` — +panel `NoteScheduled`, +state `isScheduledOpen`, +props Phase 9
- [x] `use-note-editor.ts` — +`handleScheduledChange`: update store + `saveMutation.mutate({ isScheduled, scheduledAt })`

### Phase 10 — Export, Import & Settings ✅ SELESAI
> **Hasil:** Export 6 format (TXT/MD/PDF/DOCX/XLSX/JSON), importer Keep+ColorNote+NalaKoe dengan batch Firestore, settings lengkap 4 halaman (Umum/Tampilan/Keamanan/Data)

- [x] `services/export.service.ts` — 6 format export, bulk, downloadBlob, buildExportFilename
- [x] `services/import.service.ts` — batch Firestore import (chunk 499), preserves originalCreatedAt
- [x] `lib/importer/keep-importer.ts` — parser Google Keep JSON, label→tags, color→accent, checklist blocks
- [x] `lib/importer/colornote-importer.ts` — parser ColorNote JSON, type 0/1, color index→accent
- [x] `lib/importer/nalakoe-importer.ts` — parser backup NalaKoe JSON, re-assign ID, preserve timestamps
- [x] `hooks/use-export.ts` — fetch all notes + trigger export + progress state
- [x] `hooks/use-import.ts` — parse file + batch import + ImportResult state
- [x] `components/settings/settings-shell.tsx` — layout shell dengan side nav 4 item
- [x] `components/settings/export-panel.tsx` — 6 format selector + options toggle + progress bar
- [x] `components/settings/import-panel.tsx` — source selector + file dropzone + result badge
- [x] `components/settings/index.ts` — barrel export
- [x] `app/(protected)/settings/page.tsx` — profil user + cards navigasi + logout
- [x] `app/(protected)/settings/appearance/page.tsx` — tema, accent color picker (8 preset + custom), preferensi
- [x] `app/(protected)/settings/security/page.tsx` — biometrik toggle + info enkripsi
- [x] `app/(protected)/settings/data/page.tsx` — export panel + import panel
- [x] `package.json` — +xlsx, jspdf, docx, jszip, nanoid
- [x] Unit tests: keep-importer (7 kasus), colornote-importer (7 kasus), export-service (5 kasus)

### Phase 11 — Share as Card & Seasonal Theme ✅ SELESAI
- [x] `components/notes/note-share-card.tsx`
- [x] `hooks/use-seasonal-theme.ts`
- [x] `hooks/use-accent-color.ts`
- [x] `components/settings/settings-accent-picker.tsx`
- [x] Animated note card (Framer Motion)

### Phase 12 — Testing, Polish & PWA Final ✅ SELESAI
> **Hasil:** Unit tests lengkap semua lib/, E2E Playwright core journey, PWA manifest v2, service worker 3 strategi caching, icon generator script, skip Sentry (build Vercel lebih cepat)

- [x] Unit tests: semua fungsi `lib/` — utils, format, reading-time, normalizer, color-gradient, masking
- [x] E2E tests: login → buat note → logout (Playwright, Chromium + Mobile Chrome)
- [x] PWA manifest final + semua icon sizes (script `generate:icons`)
- [x] Service worker offline caching v2 (CacheFirst / StaleWhileRevalidate / NetworkFirst)
- [x] ~~Sentry production config~~ — **SKIP** (perlu langganan, memperlambat build Vercel)
- [x] **Deploy ke GitHub + Vercel** ← HANYA DI SESI INI

---

## Checklist Wajib Setiap Akhir Sesi

- [ ] `tsc --noEmit` — tidak ada TypeScript error
- [ ] `eslint --max-warnings 0` — tidak ada ESLint error
- [ ] Semua komponen baru punya loading state
- [ ] Semua list baru punya empty state
- [ ] Semua aksi destructive pakai ConfirmDialog
- [ ] Tidak ada `any` TypeScript tanpa komentar
- [ ] Tidak ada nilai hardcoded (warna, spacing, z-index)
- [ ] Tidak ada emoji di UI
- [ ] Dark mode berfungsi di semua komponen baru
- [ ] Semua gambar pakai `next/image`
- [ ] README ini sudah diupdate
- [ ] CHANGES.md sudah diupdate

---

## Aturan README & ZIP

```
README ini       : Selalu diupdate OTOMATIS setiap akhir sesi TANPA diminta
ZIP              : Berisi SELURUH source code
CHANGES.md       : Daftar file yang berubah + alasan

Sesi baru        : Upload ZIP sesi sebelumnya + readme-nala-koe.md
                   Sebutkan phase yang akan dikerjakan
```

---

## Catatan & Issues

- **Icons PWA** — Generate dengan `npm run generate:icons` (butuh `canvas` devDep). Sudah ada script di `scripts/generate-icons.mjs`.
- **Session cookie** — Nama cookie diambil dari `SESSION_COOKIE_NAME` di `constants/config.ts` (satu sumber kebenaran). Diset via `POST /api/auth/session` dengan Firebase Admin `createSessionCookie()`. Flag: `httpOnly`, `secure` (prod), `sameSite: lax`, expire `SESSION_DURATION_SECONDS` (7 hari). Logout via `DELETE /api/auth/session`.
- **`middleware.ts`** ada di `src/` folder sesuai Next.js App Router convention.
- **Canvas Firestore collections** — `canvas_boards` + `canvas_stickies`. Perlu buat Firestore indexes: `canvas_stickies` composite index `(boardId, userId, zIndex ASC)`.
- **Biometrik PIN** — Hash PIN disimpan di localStorage (bukan enkripsi konten). Ini adalah gate UI, bukan enkripsi end-to-end.
- **Rich text (`content`)** — Sejak Sesi 15, `Note.content` punya pendamping `contentFormat: 'plain' | 'html'` (default `'plain'`, semua catatan lama otomatis aman tanpa migrasi). Catatan hanya "naik kelas" ke `'html'` pas user pertama kali pakai tombol format (Tebal/Miring/Underline/Align) di `NoteFormatToolbar` — sebelum itu tetap textarea polos seperti dulu. Vocabulary HTML dibatasi ketat ke `p/br/strong/em/u` + `style="text-align"`, disanitasi via DOMPurify (`lib/rich-text.ts: sanitizeRichHtml`) setiap kali simpan & render. Paste selalu dipaksa jadi plain text (`note-rich-editor.tsx`). Highlight feature (selection-to-bookmark) tetap beroperasi di representasi plain-text (`stripHtml(content)`) — terpisah total dari sistem mark inline, jadi tidak saling pengaruh.
- **Editor toolbar** — Dirombak jadi baris utama (Pin/Checklist/Meta/Save, ikon saja — sudah umum & sering dipakai) + menu **"Lainnya"** (dropdown berlabel teks penuh, dikelompokkan) untuk semua aksi sekunder termasuk Reaksi & Highlight yang sebelumnya hilang dari render (props-nya ada tapi tombolnya tak pernah digambar — root cause "highlight tak bisa").
- **Autosave** — `use-note-editor.ts` sekarang mem-flush perubahan yang masih pending ke Firestore saat komponen unmount (sebelumnya `clearTimeout` polos, jadi perubahan dalam window 1.5 detik terakhir sebelum pindah halaman hilang tanpa tersimpan). Perubahan antar-field dalam window debounce yang sama juga di-merge, bukan saling timpa.
- **ESLint** — Sempat rusak total (`eslint@9` butuh `eslint.config.js`, project masih `.eslintrc.json` lama → `npm run lint` selalu gagal start, jadi error sebenarnya tak pernah tertangkap berbulan-bulan). Sudah dimigrasi ke `eslint.config.mjs` (flat config) dengan rule yang sama persis.
- **Animasi** — Semua transisi baru (panel editor, dashboard, settings, stats) menghormati Settings → Tampilan → "Animasi" (`preferences.enableAnimations`), bukan cuma di note list seperti sebelumnya.
- **Test backlog yang diketahui (bukan regresi sesi ini)** — `use-read-aloud.test.ts` & `use-barcode-scanner.test.ts` gagal karena jsdom tak punya `SpeechSynthesisUtterance`/`BarcodeDetector` (perlu mock global di `tests/setup.ts`, belum dikerjakan — fitur aslinya tetap jalan normal di browser asli). E2E Playwright tak bisa dijalankan di sandbox audit ini (browser binary tak terinstal), perlu dicoba lagi di mesin dev biasa.

---

## Riwayat Sesi

| Sesi | Phase | Status | Tanggal |
|------|-------|--------|---------|
| Pre-Dev | Diskusi fitur + nama + README | ✅ Selesai | 2026-05-02 |
| Sesi 1 | Phase 0 — Setup & Foundation | ✅ Selesai | 2026-05-03 |
| Sesi 2 | Phase 1 — Auth & Layout | ✅ Selesai | 2026-05-03 |
| Sesi 3 | Phase 2 — Note Core (CRUD) | ✅ Selesai | 2026-05-04 |
| Sesi 4 | Phase 3 — Mood, Tag & Metadata | ✅ Selesai | 2026-05-04 |
| Sesi 5 | Phase 4 — Rich Features (Table, Math, URL, Font, Texture, Linked, Barcode, TTS) | ✅ Selesai | 2026-05-05 |
| Sesi 6 | Phase 5 — Timeline, Canvas & Graph | ✅ Selesai | 2026-05-06 |
| Sesi 7 | Phase 6 — Time Capsule, Secret Note, Version History & Offline Badge | ✅ Selesai | 2026-05-06 |
| Sesi 8 | Phase 7 — Organisasi & Manajemen Lanjutan | ✅ Selesai | 2026-05-06 |
| Sesi 9 | Phase 8 — Reactions, Highlights & Streak | ✅ Selesai | 2026-05-07 |
| Sesi 10 | Phase 9 — Stats Dashboard, Scheduled Note & Tag Cloud | ✅ Selesai | 2026-05-07 |
| Sesi 11 | Phase 10 — Export, Import & Settings | ✅ Selesai | 2026-05-07 |
| Sesi 12 | Phase 11 & 12 — Share Card, Seasonal Theme, PWA Final, Testing | ✅ Selesai | 2026-05-09 |
| Sesi 13 | Audit Penuh + Fix 14 Temuan (Kritis/Penting/Perlu Fix/Saran) | ✅ Selesai | 2026-05-10 |
| Sesi 14 | Audit Ulang v4 + Fix 13 Temuan — SESSION_COOKIE_NAME, logger Firestore, providers lengkap, stores action names, tailwind CSS vars, database.rules | ✅ Selesai | 2026-05-14 |
| Sesi 15 | Audit Klik/Render + Rich Text Editor + Toolbar Redesign + Polish Animasi Menyeluruh | ✅ Selesai | 2026-06-18 |

---

*readme-nala-koe.md — Dibuat: 2026-05-02 — Token Version: 1.0.0*
*Terakhir diperbarui: Sesi 15 — Rich Text Editor + Toolbar Redesign + Polish — 2026-06-18 — Lihat CHANGES.md untuk detail*
*Update otomatis setiap akhir sesi oleh Claude*
