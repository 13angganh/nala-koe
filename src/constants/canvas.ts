// ─── Canvas / Sticky Note Constants ──────────────────────────────────────────
// Sumber kebenaran tunggal untuk warna dan konfigurasi canvas.
// Dipakai oleh canvas-sticky.tsx dan canvas-board.tsx.

import { colors } from '@/tokens/colors';

// Warna pilihan untuk sticky notes.
// Direpresentasikan sebagai nilai hex karena dipakai sebagai:
//   1. backgroundColor CSS inline style pada element DOM
//   2. Data value yang disimpan ke Firestore
// Bukan CSS utility class — tidak melewati Tailwind.
export const CANVAS_STICKY_COLORS: { value: string; label: string }[] = [
  { value: '#fef08a', label: 'Kuning' },
  { value: '#bbf7d0', label: 'Hijau' },
  { value: '#bfdbfe', label: 'Biru' },
  { value: '#fecaca', label: 'Merah' },
  { value: '#e9d5ff', label: 'Ungu' },
  { value: '#fed7aa', label: 'Oranye' },
  { value: '#f1f5f9', label: 'Abu' },
];

// Nilai hex warna "Abu" — dipakai untuk conditional text color.
// reason: diperlukan perbandingan runtime antara nilai hex yang disimpan di Firestore.
export const CANVAS_STICKY_LIGHT_COLOR = '#f1f5f9';

// Warna border swatch yang sedang dipilih — pakai brand token.
export const CANVAS_STICKY_SELECTED_BORDER = colors.brand[500]; // '#0ea5e9'

// Default color untuk sticky note baru
export const CANVAS_STICKY_DEFAULT_COLOR = CANVAS_STICKY_COLORS[0].value; // kuning
