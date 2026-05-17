// tests/utils.tsx — render helper dengan providers untuk testing
// Import queryClient dari lib/query-client (bukan dibuat inline di sini)
// sehingga konsisten dengan app actual.
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClientProvider }        from '@tanstack/react-query';
import { QueryClient }                from '@tanstack/react-query';
import type { ReactElement }          from 'react';

// Buat QueryClient khusus test — retry: false agar test tidak menunggu retry
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries:   { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  // Buat instance baru per test — mencegah state bocor antar test
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export semua dari testing-library untuk kemudahan import
export * from '@testing-library/react';
