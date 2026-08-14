'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { getIdToken } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerWithEmail, loginWithGoogle } from '@/services/auth.service';
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema';
import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/firebase';
import { NalaKoeLogo } from '@/components/shared/nalakoe-logo';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  /**
   * Set session cookie via server API route (httpOnly, secure).
   * Bukan document.cookie — session token nyata dari Firebase Admin.
   *
   * Same fix as login/page.tsx (v1.2.6): returns whether the cookie POST
   * was actually confirmed (response.ok), instead of navigating regardless.
   * This file had the same unguarded pattern login/page.tsx used to have —
   * missed in the earlier fix because only the login flow was reported at
   * the time, but register goes through the identical session-cookie +
   * navigate sequence and is exposed to the same cookie race condition.
   */
  const setServerSession = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    const idToken = await getIdToken(currentUser);
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    return response.ok;
  };

  // See login/page.tsx's goToDestination for the full writeup — router.refresh()
  // before router.replace() is the fix for the App Router cookie race
  // condition (redirect can otherwise reach middleware before the just-set
  // session cookie is committed by the browser).
  const goToDestination = () => {
    router.refresh();
    router.replace(ROUTES.DASHBOARD);
  };

  const onSubmit = async (data: RegisterInput) => {
    const result = await registerWithEmail(data.email, data.password, data.displayName);
    if (result.error === null) {
      const sessionOk = await setServerSession();
      if (!sessionOk) {
        toast.error('Akun dibuat, tapi gagal membuat sesi. Coba masuk lagi.');
        return;
      }
      toast.success('Akun berhasil dibuat!');
      goToDestination();
    } else {
      toast.error(result.error.message);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    if (result.error === null) {
      const sessionOk = await setServerSession();
      setIsGoogleLoading(false);
      if (!sessionOk) {
        toast.error('Berhasil masuk, tapi gagal membuat sesi. Coba lagi.');
        return;
      }
      goToDestination();
    } else {
      setIsGoogleLoading(false);
      toast.error(result.error.message);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-base)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f172a] text-white">
            <NalaKoeLogo size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Buat akunmu</h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">Mulai catat pikiran dan nuraniku hari ini</p>
        </div>

        <Button type="button" variant="outline" size="lg" className="w-full gap-3"
          onClick={handleGoogle} isLoading={isGoogleLoading} disabled={isSubmitting}>
          <Chrome className="h-4 w-4" aria-hidden="true" />
          Daftar dengan Google
        </Button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-sm text-[var(--text-tertiary)]">atau</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="displayName" className="block text-sm font-medium text-[var(--text-primary)]">Nama</label>
            <Input id="displayName" type="text" autoComplete="name" placeholder="Nama panggilanmu"
              error={Boolean(errors.displayName)} disabled={isSubmitting || isGoogleLoading} {...register('displayName')} />
            {errors.displayName && <p className="text-sm text-[var(--error)]" role="alert">{errors.displayName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">Email</label>
            <Input id="email" type="email" autoComplete="email" placeholder="kamu@email.com"
              error={Boolean(errors.email)} disabled={isSubmitting || isGoogleLoading} {...register('email')} />
            {errors.email && <p className="text-sm text-[var(--error)]" role="alert">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'}
                autoComplete="new-password" placeholder="Min. 8 karakter, huruf kapital & angka"
                error={Boolean(errors.password)} disabled={isSubmitting || isGoogleLoading}
                className="pr-10" {...register('password')} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-[var(--error)]" role="alert">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)]">Konfirmasi Password</label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Ulangi password"
              error={Boolean(errors.confirmPassword)} disabled={isSubmitting || isGoogleLoading} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-sm text-[var(--error)]" role="alert">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} disabled={isGoogleLoading}>
            Buat Akun
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Sudah punya akun?{' '}
          <Link href={ROUTES.LOGIN} className="text-[var(--accent)] hover:underline font-medium">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
