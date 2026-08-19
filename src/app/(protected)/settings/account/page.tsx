'use client';

import { useState } from 'react';
import { UserCircle, Mail, Calendar, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsShell } from '@/components/settings/settings-shell';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth.store';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { sendResetEmail } from '@/services/auth.service';
import { formatDate } from '@/lib/format';

// Reported: "tidak ada pengaturan akun" — settings had Tampilan/Keamanan/
// Data but nothing under "who am I / how do I reach my account". This page
// covers what auth.service.ts already supports today: viewing account
// info and requesting a password reset. Full profile editing (changing
// display name, email, or setting a new password directly, plus account
// deletion) needs Firebase reauthentication flows that don't exist in the
// service layer yet — that's a separate, larger piece of work than this
// session; noted in the README instead of half-built here.
export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  // useConfirmDialog's own JSDoc claims a global <ConfirmDialog /> lives
  // in the root layout — it doesn't (verified: no such instance exists
  // anywhere in the codebase; canvas-board.tsx calls confirm() from this
  // same hook without ever rendering the dialog, so its confirm() promise
  // can never resolve — a separate pre-existing bug, out of scope for this
  // pass but worth fixing alongside the JSDoc later). Rendering
  // <ConfirmDialog {...dialogProps} /> explicitly here, matching how
  // every other actually-working caller (note-list.tsx etc.) does it.
  const { confirm, dialogProps } = useConfirmDialog();
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Only email/password accounts have a password to reset — an
  // account signed in only via Google has no NalaKoe-side password,
  // so the reset action would silently do nothing useful for them.
  const hasPasswordProvider = user?.providerData.some((p) => p.providerId === 'password') ?? false;

  const handleSendReset = async () => {
    if (!user?.email) return;
    const ok = await confirm({
      title: 'Kirim email reset password?',
      description: `Tautan reset password akan dikirim ke ${user.email}.`,
      confirmLabel: 'Kirim',
    });
    if (!ok) return;

    setIsSendingReset(true);
    const result = await sendResetEmail(user.email);
    setIsSendingReset(false);

    if (result.error === null) {
      toast.success('Email reset password sudah dikirim. Cek juga folder spam kalau belum terlihat.');
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <SettingsShell>
      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">
              Info Akun
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <UserCircle className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">Nama</p>
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {user?.displayName ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <Mail className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">Email</p>
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {user?.email ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <Calendar className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">Bergabung sejak</p>
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {user?.metadata.creationTime ? formatDate(new Date(user.metadata.creationTime)) : '—'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {hasPasswordProvider && (
          <>
            <div className="border-t border-[var(--border)]" />
            <section>
              <div className="mb-4 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Password
                </h2>
              </div>
              <p className="mb-4 text-sm text-[var(--text-secondary)]">
                Ubah password lewat tautan reset yang dikirim ke email terdaftar.
              </p>
              <Button variant="outline" onClick={handleSendReset} isLoading={isSendingReset}>
                Kirim email reset password
              </Button>
            </section>
          </>
        )}
      </div>
      <ConfirmDialog {...dialogProps} />
    </SettingsShell>
  );
}
