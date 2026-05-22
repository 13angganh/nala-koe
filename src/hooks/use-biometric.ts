'use client';

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

type BiometricState = 'idle' | 'prompting' | 'success' | 'failed' | 'unavailable';

export interface UseBiometricReturn {
  isSupported: boolean;
  state: BiometricState;
  isUnlocked: boolean;
  promptBiometric: () => Promise<boolean>;
  lock: () => void;
  reset: () => void;
}

const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const RP_NAME = 'NalaKoe';
const STORAGE_KEY = 'nalakoe_secret_credential';

// ─── Web Authn helpers ────────────────────────────────────────────────────────

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function registerCredential(): Promise<string | null> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { id: RP_ID, name: RP_NAME },
        user: { id: userId, name: 'nalakoe-user', displayName: 'NalaKoe User' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    });

    if (!credential) return null;
    const pkCred = credential as PublicKeyCredential;
    return bufferToBase64(pkCred.rawId);
  } catch (error) {
    logger.warn('biometric.register.failed', { error });
    return null;
  }
}

async function verifyCredential(credentialId: string): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        allowCredentials: [
          {
            type: 'public-key',
            id: base64ToBuffer(credentialId).buffer as ArrayBuffer,
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return assertion !== null;
  } catch (error) {
    logger.warn('biometric.verify.failed', { error });
    return false;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBiometric(noteId: string): UseBiometricReturn {
  const storageKey = `${STORAGE_KEY}_${noteId}`;

  const [isSupported, setIsSupported] = useState(false);
  const [state, setState] = useState<BiometricState>('idle');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      typeof PublicKeyCredential !== 'undefined';
    setIsSupported(supported);

    if (!supported) setState('unavailable');
  }, []);

  const promptBiometric = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setState('prompting');

    try {
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        // Already registered — verify
        const ok = await verifyCredential(stored);
        if (ok) {
          setState('success');
          setIsUnlocked(true);
          return true;
        }
        setState('failed');
        return false;
      } else {
        // First time — register then immediately verify
        const credId = await registerCredential();
        if (credId) {
          localStorage.setItem(storageKey, credId);
          // Immediately verify after registration
          const ok = await verifyCredential(credId);
          if (ok) {
            setState('success');
            setIsUnlocked(true);
            return true;
          }
        }
        setState('failed');
        return false;
      }
    } catch {
      setState('failed');
      return false;
    }
  }, [isSupported, storageKey]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setState('idle');
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsUnlocked(false);
    setState('idle');
  }, [storageKey]);

  return { isSupported, state, isUnlocked, promptBiometric, lock, reset };
}
