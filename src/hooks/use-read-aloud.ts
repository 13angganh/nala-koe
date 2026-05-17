'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReadAloudStatus = 'idle' | 'playing' | 'paused';

export interface ReadAloudVoice {
  name: string;
  lang: string;
  voiceURI: string;
}

interface UseReadAloudReturn {
  isSupported: boolean;
  status: ReadAloudStatus;
  voices: ReadAloudVoice[];
  selectedVoice: ReadAloudVoice | null;
  rate: number;
  progress: number; // 0–1, approximate
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: ReadAloudVoice) => void;
  setRate: (rate: number) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReadAloud(): UseReadAloudReturn {
  const [status, setStatus] = useState<ReadAloudStatus>('idle');
  const [voices, setVoices] = useState<ReadAloudVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<ReadAloudVoice | null>(null);
  const [rate, setRateState] = useState(1);
  const [progress, setProgress] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalCharsRef = useRef(0);
  const spokenCharsRef = useRef(0);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    function loadVoices() {
      const raw = window.speechSynthesis.getVoices();
      const mapped: ReadAloudVoice[] = raw.map((v) => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
      }));
      setVoices(mapped);

      // Auto-select Indonesian voice if available, else first
      const id = mapped.find((v) => v.lang.startsWith('id'));
      setSelectedVoice((prev) => prev ?? id ?? mapped[0] ?? null);
    }

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [isSupported]);

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();
      setProgress(0);
      spokenCharsRef.current = 0;
      totalCharsRef.current = text.length;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;

      if (selectedVoice) {
        const match = window.speechSynthesis
          .getVoices()
          .find((v) => v.voiceURI === selectedVoice.voiceURI);
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => setStatus('playing');
      utterance.onend = () => {
        setStatus('idle');
        setProgress(1);
      };
      utterance.onerror = () => setStatus('idle');
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          spokenCharsRef.current = e.charIndex;
          setProgress(
            totalCharsRef.current > 0
              ? spokenCharsRef.current / totalCharsRef.current
              : 0
          );
        }
      };
      utterance.onpause = () => setStatus('paused');
      utterance.onresume = () => setStatus('playing');

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, selectedVoice]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setStatus('idle');
    setProgress(0);
  }, [isSupported]);

  const setVoice = useCallback((voice: ReadAloudVoice) => {
    setSelectedVoice(voice);
  }, []);

  const setRate = useCallback((r: number) => {
    setRateState(Math.min(3, Math.max(0.5, r)));
  }, []);

  return {
    isSupported,
    status,
    voices,
    selectedVoice,
    rate,
    progress,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
  };
}
