import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Vitest's default include pattern (**/*.{test,spec}.*) has no
    // concept of tests/unit vs tests/e2e — without scoping it explicitly,
    // it was also picking up tests/e2e/**/*.spec.ts (Playwright specs,
    // which use their own test.describe()/test() from @playwright/test,
    // not Vitest's) and trying to run them as Vitest tests. That call
    // fails immediately (Playwright's test.describe() errors outside a
    // Playwright runner), which is what was surfacing as a permanently
    // failing "test file" in every vitest run — it was never a real test
    // failure, just the wrong runner picking up the wrong files.
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', '.next/', 'tests/', '**/*.config.*', 'src/app/'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
