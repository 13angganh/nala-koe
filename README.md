# NalaKoe 📓

> Catatan pribadimu yang hidup dan bernapas.

NalaKoe adalah aplikasi jurnal/catatan personal berbasis Next.js 15 + Firebase, dirancang sebagai PWA mobile-first dengan UX yang bersih, fitur kaya (mood tracking, timeline, canvas sticky notes, stats), dan arsitektur yang maintainable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Auth + DB | Firebase Auth + Firestore |
| Storage | Firebase Storage |
| State | Zustand (global) + TanStack Query (server) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS + CSS Custom Properties |
| Animation | Framer Motion |
| Toast | Sonner |
| Monitoring | Sentry |
| Testing | Vitest + Playwright |
| PWA | Custom Service Worker (CacheFirst/NetworkFirst) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Firebase project (Auth + Firestore + Storage)

### Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd nalakoe
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all variables in .env.local

# 3. Set up Husky hooks
npm run prepare

# 4. Run dev server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint (zero warnings)
npm run type-check   # TypeScript check
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright e2e tests
npm run format       # Prettier format
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, Register (unauthenticated)
│   ├── (protected)/       # Dashboard, Notes, Canvas, etc.
│   ├── api/               # Route handlers
│   ├── offline/           # PWA offline fallback page
│   ├── layout.tsx         # Root layout (fonts, dark mode, toast)
│   ├── error.tsx          # Global error boundary
│   ├── not-found.tsx      # 404 page
│   └── globals.css        # CSS variables + base styles
│
├── components/
│   ├── ui/                # Primitive components (Button, Input, etc.)
│   ├── shared/            # App-level shared (ErrorBoundary, EmptyState, etc.)
│   ├── forms/             # Form components (Phase 1+)
│   ├── layouts/           # Layout shells (Phase 1+)
│   ├── notes/             # Note-specific components (Phase 2+)
│   └── ...
│
├── tokens/                # Design system tokens (colors, spacing, animation…)
├── types/                 # TypeScript type definitions
├── constants/             # Routes, config, moods, z-index
├── schemas/               # Zod validation schemas
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions + integrations
│   ├── utils.ts           # cn, slugify, truncate, generateId…
│   ├── format.ts          # ALL formatting (dates, numbers, words)
│   ├── logger.ts          # Structured logging + Sentry
│   ├── firebase.ts        # Firebase client SDK (singleton)
│   ├── firebase-admin.ts  # Firebase Admin SDK (server only)
│   ├── env.ts             # Zod env validation
│   └── ...
├── services/              # Firestore service classes (Phase 1+)
└── stores/                # Zustand stores (Phase 1+)
```

---

## Architecture Rules

### 1. CSS Variables — not Tailwind JIT for theming
All color tokens live in `globals.css` as CSS custom properties (`--accent`, `--surface-base`, etc.). This enables runtime theme switching without rehydration flicker.

```tsx
// ✅ Do
<div className="bg-[var(--surface-subtle)]" />

// ❌ Don't (breaks dark mode without full re-render)
<div className="bg-slate-50 dark:bg-slate-900" />
```

### 2. All formatting via `lib/format.ts`
Never use `date-fns`, `Intl.NumberFormat`, or `Intl.DateTimeFormat` directly in components.

```tsx
// ✅
import { formatDateSmart, formatWordCount } from '@/lib/format';

// ❌
import { formatDistanceToNow } from 'date-fns';
```

### 3. Routes from `constants/routes.ts`
```tsx
// ✅
import { ROUTES } from '@/constants/routes';
router.push(ROUTES.NOTE(id));

// ❌
router.push(`/notes/${id}`);
```

### 4. Z-index from `tokens/z-index.ts`
No arbitrary `z-[999]` values anywhere.

### 5. Server-only imports
`lib/firebase-admin.ts` must never be imported in client components.

---

## Development Phases

| Phase | Focus | Status |
|---|---|---|
| **0 — Foundation** | Config, types, tokens, base UI | ✅ Done |
| **1 — Auth** | Login, register, auth guard | ⏳ Next |
| **2 — Notes CRUD** | List, create, edit, delete | 🔜 |
| **3 — Rich Editor** | Blocks, checklist, image, table | 🔜 |
| **4 — Organization** | Tags, filters, search, archive, trash | 🔜 |
| **5 — Canvas** | Sticky board, drag-drop | 🔜 |
| **6 — Timeline** | Scrolling timeline view | 🔜 |
| **7 — Stats** | Writing stats, mood insights | 🔜 |
| **8 — Advanced** | Time capsule, graph, import/export | 🔜 |
| **9 — Polish** | Animations, PWA, a11y audit | 🔜 |

---

## Environment Variables

See `.env.example` for all required variables. Never commit `.env.local`.

---

## Contributing

1. Create feature branch from `main`
2. `npm run lint && npm run type-check` must pass
3. Add tests for new utilities
4. Update `CHANGES.md`
