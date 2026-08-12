import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    return Object.assign(document.createElement('img'), { src, alt, ...props });
  },
}));

// jsdom doesn't implement the Web Speech API — SpeechSynthesisUtterance
// doesn't exist on window at all here, which breaks vi.spyOn() in
// use-read-aloud.test.ts (spyOn needs the property to already exist to
// spy on it). This is a bare constructor stub only so that spyOn has
// something to attach to; the test file's own
// vi.spyOn(window, 'SpeechSynthesisUtterance').mockImplementation(...)
// (in its beforeEach) is what actually defines the mocked behavior per
// test. Registered globally here (rather than per test-file) since any
// future test touching read-aloud functionality would hit the same
// missing-global problem.
if (typeof window !== 'undefined' && !('SpeechSynthesisUtterance' in window)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason: minimal test-environment stub for a Web Speech API constructor jsdom doesn't implement; not worth typing out the full interface here since every test that uses it replaces the implementation via vi.spyOn anyway
  (window as any).SpeechSynthesisUtterance = class SpeechSynthesisUtterance {};
}

// Suppress console in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
