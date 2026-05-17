import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReadAloud } from '@/hooks/use-read-aloud';

// ─── SpeechSynthesis mock ─────────────────────────────────────────────────────

function makeMockSpeechSynthesis() {
  const listeners: Record<string, EventListener> = {};
  const utterances: SpeechSynthesisUtterance[] = [];

  const mockSynth = {
    speak: vi.fn((u: SpeechSynthesisUtterance) => {
      utterances.push(u);
      // Simulate async start
      setTimeout(() => u.onstart?.(new Event('start') as SpeechSynthesisEvent), 0);
    }),
    cancel: vi.fn(() => {
      // Simulate onerror on active utterances
      utterances.forEach((u) =>
        u.onerror?.(new Event('error') as SpeechSynthesisErrorEvent)
      );
      utterances.length = 0;
    }),
    pause: vi.fn(() => {
      utterances.forEach((u) => u.onpause?.(new Event('pause') as SpeechSynthesisEvent));
    }),
    resume: vi.fn(() => {
      utterances.forEach((u) => u.onresume?.(new Event('resume') as SpeechSynthesisEvent));
    }),
    getVoices: vi.fn(() => [
      { name: 'Google Bahasa Indonesia', lang: 'id-ID', voiceURI: 'id-ID-1' },
      { name: 'Google US English', lang: 'en-US', voiceURI: 'en-US-1' },
    ]),
    addEventListener: vi.fn((event: string, listener: EventListener) => {
      listeners[event] = listener;
    }),
    removeEventListener: vi.fn(),
    // Allow simulating voiceschanged
    _triggerVoicesChanged: () => listeners['voiceschanged']?.(new Event('voiceschanged')),
  };
  return mockSynth;
}

describe('useReadAloud', () => {
  let mockSynth: ReturnType<typeof makeMockSpeechSynthesis>;

  beforeEach(() => {
    mockSynth = makeMockSpeechSynthesis();
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSynth,
      writable: true,
      configurable: true,
    });
    vi.spyOn(window, 'SpeechSynthesisUtterance').mockImplementation(
      (text?: string) => {
        const u = {
          text: text ?? '',
          rate: 1,
          voice: null,
          onstart: null,
          onend: null,
          onerror: null,
          onpause: null,
          onresume: null,
          onboundary: null,
        } as unknown as SpeechSynthesisUtterance;
        return u;
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── isSupported ─────────────────────────────────────────────────────────────

  it('reports isSupported true when speechSynthesis exists', () => {
    const { result } = renderHook(() => useReadAloud());
    expect(result.current.isSupported).toBe(true);
  });

  it('reports isSupported false when speechSynthesis is absent', () => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, writable: true });
    const { result } = renderHook(() => useReadAloud());
    expect(result.current.isSupported).toBe(false);
  });

  // ── voices ──────────────────────────────────────────────────────────────────

  it('loads voices on mount', () => {
    const { result } = renderHook(() => useReadAloud());
    expect(result.current.voices).toHaveLength(2);
  });

  it('auto-selects Indonesian voice when available', () => {
    const { result } = renderHook(() => useReadAloud());
    expect(result.current.selectedVoice?.lang).toContain('id');
  });

  // ── rate ────────────────────────────────────────────────────────────────────

  it('starts with rate 1', () => {
    const { result } = renderHook(() => useReadAloud());
    expect(result.current.rate).toBe(1);
  });

  it('setRate clamps to 0.5–3 range', () => {
    const { result } = renderHook(() => useReadAloud());

    act(() => result.current.setRate(0.1));
    expect(result.current.rate).toBe(0.5);

    act(() => result.current.setRate(99));
    expect(result.current.rate).toBe(3);

    act(() => result.current.setRate(1.5));
    expect(result.current.rate).toBe(1.5);
  });

  // ── speak ───────────────────────────────────────────────────────────────────

  it('calls speechSynthesis.speak when speak() is invoked', () => {
    const { result } = renderHook(() => useReadAloud());
    act(() => result.current.speak('Halo dunia'));
    expect(mockSynth.speak).toHaveBeenCalledOnce();
  });

  it('status transitions to "playing" after speak()', async () => {
    const { result } = renderHook(() => useReadAloud());
    act(() => result.current.speak('test'));
    // Allow setTimeout to fire
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(result.current.status).toBe('playing');
  });

  // ── pause / resume ──────────────────────────────────────────────────────────

  it('calls pause on speechSynthesis', () => {
    const { result } = renderHook(() => useReadAloud());
    act(() => result.current.pause());
    expect(mockSynth.pause).toHaveBeenCalled();
  });

  it('calls resume on speechSynthesis', () => {
    const { result } = renderHook(() => useReadAloud());
    act(() => result.current.resume());
    expect(mockSynth.resume).toHaveBeenCalled();
  });

  // ── stop ────────────────────────────────────────────────────────────────────

  it('calls cancel on speechSynthesis when stop() is called', () => {
    const { result } = renderHook(() => useReadAloud());
    act(() => result.current.stop());
    expect(mockSynth.cancel).toHaveBeenCalled();
  });

  it('resets status to idle and progress to 0 on stop', () => {
    const { result } = renderHook(() => useReadAloud());
    act(() => result.current.stop());
    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);
  });

  // ── setVoice ────────────────────────────────────────────────────────────────

  it('setVoice updates selectedVoice', () => {
    const { result } = renderHook(() => useReadAloud());
    const newVoice = { name: 'English', lang: 'en-US', voiceURI: 'en-US-1' };
    act(() => result.current.setVoice(newVoice));
    expect(result.current.selectedVoice?.voiceURI).toBe('en-US-1');
  });
});
