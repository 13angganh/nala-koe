// lib/query-client.ts
// Singleton QueryClient — satu-satunya instance yang dipakai di seluruh app.
// Import di components/shared/providers.tsx dan src/test/utils.tsx.
//
// Query key convention — SELALU array, tidak pernah string:
//   ['entity']                         → semua data entity
//   ['entity', id]                     → satu item
//   ['entity', { filter, page }]       → dengan filter/pagination
//   ['entity', 'infinite', { filter }] → infinite scroll
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,  // 5 menit
      gcTime:               1000 * 60 * 10, // 10 menit (garbage collect)
      retry:                1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
