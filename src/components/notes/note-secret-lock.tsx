'use client';

import { useId, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  LockOpen,
  ShieldCheck,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBiometric } from '@/hooks/use-biometric';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

// ─── PIN helpers ──────────────────────────────────────────────────────────────

const PIN_LENGTH = 6;
const PIN_STORAGE_KEY = 'nalakoe_secret_pin';

function hashPin(noteId: string, pin: string): string {
  // Simple deterministic hash — not cryptographic, but enough for local storage
  const str = `${noteId}:${pin}:nalakoe`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return String(Math.abs(hash));
}

function getStoredPinHash(noteId: string): string | null {
  try {
    const stored = localStorage.getItem(`${PIN_STORAGE_KEY}_${noteId}`);
    return stored;
  } catch {
    return null;
  }
}

function storePinHash(noteId: string, pin: string): void {
  try {
    localStorage.setItem(`${PIN_STORAGE_KEY}_${noteId}`, hashPin(noteId, pin));
  } catch {
    // ignore
  }
}

function removePinHash(noteId: string): void {
  try {
    localStorage.removeItem(`${PIN_STORAGE_KEY}_${noteId}`);
  } catch {
    // ignore
  }
}

function verifyPin(noteId: string, pin: string): boolean {
  const stored = getStoredPinHash(noteId);
  if (!stored) return false;
  return stored === hashPin(noteId, pin);
}

function hasPinSetup(noteId: string): boolean {
  return getStoredPinHash(noteId) !== null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SecretMode = 'locked' | 'pin-setup' | 'pin-verify' | 'unlocked' | 'remove-confirm';

interface NoteSecretLockProps {
  noteId: string;
  isSecret: boolean;
  isUnlocked?: boolean;
  onSecretChange: (isSecret: boolean) => void;
  onUnlock: () => void;
  onLock: () => void;
  className?: string;
}

// ─── PIN input display ────────────────────────────────────────────────────────

function PinDots({ value, length }: { value: string; length: number }) {
  return (
    <div className="flex items-center gap-2 justify-center" aria-hidden="true">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-3 w-3 rounded-full border-2 transition-all duration-150',
            i < value.length
              ? 'border-[var(--accent)] bg-[var(--accent)]'
              : 'border-[var(--border)] bg-transparent'
          )}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NoteSecretLock({
  noteId,
  isSecret,
  isUnlocked = false,
  onSecretChange,
  onUnlock,
  onLock,
  className,
}: NoteSecretLockProps) {
  const id = useId();
  const [mode, setMode] = useState<SecretMode>(
    isSecret && !isUnlocked ? 'locked' : isSecret ? 'unlocked' : 'locked'
  );
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);

  const pinInputRef = useRef<HTMLInputElement>(null);
  const { isSupported: biometricSupported, state: biometricState, promptBiometric } = useBiometric(noteId);

  // ── Enable secret ────────────────────────────────────────────────────────

  function handleEnableSecret() {
    if (hasPinSetup(noteId)) {
      setMode('pin-verify');
    } else {
      setMode('pin-setup');
    }
    setPin('');
    setConfirmPin('');
    setPinError(null);
    setTimeout(() => pinInputRef.current?.focus(), 100);
  }

  // ── PIN setup ────────────────────────────────────────────────────────────

  function handlePinSetupSubmit() {
    if (pin.length < PIN_LENGTH) {
      setPinError(`PIN harus ${PIN_LENGTH} digit.`);
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PIN tidak cocok. Coba lagi.');
      setConfirmPin('');
      return;
    }
    storePinHash(noteId, pin);
    onSecretChange(true);
    onUnlock();
    setMode('unlocked');
    setPin('');
    setConfirmPin('');
    setPinError(null);
  }

  // ── PIN verify ────────────────────────────────────────────────────────────

  function handlePinVerify() {
    if (!verifyPin(noteId, pin)) {
      setPinError('PIN salah. Coba lagi.');
      setPin('');
      return;
    }
    onUnlock();
    setMode('unlocked');
    setPin('');
    setPinError(null);
  }

  // ── Biometric ─────────────────────────────────────────────────────────────

  async function handleBiometricUnlock() {
    const ok = await promptBiometric();
    if (ok) {
      onUnlock();
      setMode('unlocked');
    } else {
      setPinError('Autentikasi gagal. Gunakan PIN sebagai pengganti.');
    }
  }

  // ── Lock ─────────────────────────────────────────────────────────────────

  function handleLock() {
    onLock();
    setMode('locked');
    setPin('');
    setPinError(null);
  }

  // ── Remove secret ─────────────────────────────────────────────────────────

  function confirmRemoveSecret() {
    removePinHash(noteId);
    onSecretChange(false);
    onUnlock(); // stays "unlocked" visually — content revealed
    setMode('locked'); // reset internal state
    setRemoveConfirm(false);
  }

  // ── PIN input change ──────────────────────────────────────────────────────

  function handlePinChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(digits);
    setPinError(null);
  }

  function handleConfirmPinChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setConfirmPin(digits);
    setPinError(null);
  }

  // ── Not secret yet — show enable button ──────────────────────────────────

  if (!isSecret) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
          <p className="text-xs font-medium text-[var(--text-primary)]">Catatan Rahasia</p>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Kunci catatan ini dengan PIN. Tampil sebagai kunci di daftar catatan.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleEnableSecret}
          className="h-8 text-xs w-full"
        >
          <Lock className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          Aktifkan kunci rahasia
        </Button>

        {/* PIN setup form */}
        {mode === 'pin-setup' && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Buat PIN baru</p>
            <PinDots value={pin} length={PIN_LENGTH} />
            <div className="relative">
              <Input
                ref={pinInputRef}
                id={`${id}-pin`}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={`PIN ${PIN_LENGTH} digit`}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                maxLength={PIN_LENGTH}
                className="h-8 text-xs pr-8"
                aria-label="Masukkan PIN baru"
                onKeyDown={(e) => e.key === 'Enter' && pin.length === PIN_LENGTH && setPin(pin)}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Konfirmasi PIN"
              value={confirmPin}
              onChange={(e) => handleConfirmPinChange(e.target.value)}
              maxLength={PIN_LENGTH}
              className="h-8 text-xs"
              aria-label="Konfirmasi PIN"
              onKeyDown={(e) => e.key === 'Enter' && confirmPin.length === PIN_LENGTH && handlePinSetupSubmit()}
            />
            {pinError && (
              <p className="flex items-center gap-1 text-xs text-[var(--error)]">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {pinError}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setMode('locked')} className="h-7 text-xs flex-1">
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handlePinSetupSubmit}
                disabled={pin.length < PIN_LENGTH || confirmPin.length < PIN_LENGTH}
                className="h-7 text-xs flex-1"
              >
                Simpan PIN
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Locked state ───────────────────────────────────────────────────────────

  if (isSecret && !isUnlocked && mode !== 'pin-verify') {
    return (
      <div
        className={cn(
          'rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3 space-y-3',
          className
        )}
        role="region"
        aria-label="Catatan rahasia terkunci"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-muted)] shrink-0">
              <Lock className="h-3.5 w-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-[var(--text-primary)]">Catatan Rahasia</p>
          </div>
        </div>

        <div className="flex gap-2">
          {biometricSupported && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBiometricUnlock}
              disabled={biometricState === 'prompting'}
              className="h-8 text-xs flex-1 gap-1.5"
              aria-label="Buka dengan biometrik"
            >
              {biometricState === 'prompting' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Fingerprint className="h-3.5 w-3.5" />
              )}
              Biometrik
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMode('pin-verify');
              setPin('');
              setPinError(null);
              setTimeout(() => pinInputRef.current?.focus(), 100);
            }}
            className="h-8 text-xs flex-1 gap-1.5"
            aria-label="Buka dengan PIN"
          >
            <KeyRound className="h-3.5 w-3.5" />
            PIN
          </Button>
        </div>
      </div>
    );
  }

  // ── PIN verify form ───────────────────────────────────────────────────────

  if (mode === 'pin-verify') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
          <p className="text-xs font-medium text-[var(--text-primary)]">Masukkan PIN</p>
        </div>
        <PinDots value={pin} length={PIN_LENGTH} />
        <div className="relative">
          <Input
            ref={pinInputRef}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={`PIN ${PIN_LENGTH} digit`}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            maxLength={PIN_LENGTH}
            className="h-8 text-xs pr-8"
            aria-label="Masukkan PIN untuk membuka catatan"
            onKeyDown={(e) => e.key === 'Enter' && pin.length === PIN_LENGTH && handlePinVerify()}
          />
          <button
            type="button"
            onClick={() => setShowPin((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
          >
            {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {pinError && (
          <p className="flex items-center gap-1 text-xs text-[var(--error)]">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {pinError}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode('locked')}
            className="h-7 text-xs flex-1"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handlePinVerify}
            disabled={pin.length < PIN_LENGTH}
            className="h-7 text-xs flex-1"
          >
            Buka
          </Button>
        </div>
      </div>
    );
  }

  // ── Unlocked state ────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
          <p className="text-xs font-medium text-[var(--text-primary)]">Catatan Rahasia</p>
          <span className="rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-xs text-[var(--success)] font-medium">
            Terbuka
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleLock}
          className="h-7 text-xs flex-1 gap-1.5"
        >
          <LockOpen className="h-3.5 w-3.5" />
          Kunci lagi
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setRemoveConfirm(true)}
          className="h-7 text-xs text-[var(--error)] hover:bg-[var(--error)]/10 flex-1"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Hapus kunci
        </Button>
      </div>

      <ConfirmDialog
        open={removeConfirm}
        onOpenChange={setRemoveConfirm}
        title="Hapus kunci rahasia?"
        description="Catatan ini tidak akan terkunci lagi. PIN yang tersimpan akan dihapus."
        confirmLabel="Hapus kunci"
        variant="destructive"
        onConfirm={confirmRemoveSecret}
      />
    </div>
  );
}
