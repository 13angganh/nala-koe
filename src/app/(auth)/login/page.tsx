'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { getIdToken } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginWithEmail, loginWithGoogle } from '@/services/auth.service';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? ROUTES.DASHBOARD;
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  /**
   * Set session cookie via server API route (httpOnly, secure).
   * Bukan document.cookie — session token nyata dari Firebase Admin.
   */
  const setServerSession = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const idToken = await getIdToken(currentUser);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  };

  const onSubmit = async (data: LoginInput) => {
    const result = await loginWithEmail(data.email, data.password);
    if (result.error === null) {
      await setServerSession();
      router.replace(from);
    } else {
      toast.error(result.error.message);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (result.error === null) {
      await setServerSession();
      router.replace(from);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-base)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Masuk ke NalaKoe</h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">Selamat datang kembali di ruang pikiranmu</p>
        </div>

        <Button type="button" variant="outline" size="lg" className="w-full gap-3"
          onClick={handleGoogle} isLoading={isGoogleLoading} disabled={isSubmitting}>
          <Chrome className="h-4 w-4" aria-hidden="true" />
          Masuk dengan Google
        </Button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-sm text-[var(--text-tertiary)]">atau</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">Email</label>
            <Input id="email" type="email" autoComplete="email" placeholder="kamu@email.com"
              error={Boolean(errors.email)} disabled={isSubmitting || isGoogleLoading} {...register('email')} />
            {errors.email && <p className="text-sm text-[var(--error)]" role="alert">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">Password</label>
              <Link href="/forgot-password" className="text-sm text-[var(--accent)] hover:underline" tabIndex={-1}>
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" placeholder="••••••••"
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

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} disabled={isGoogleLoading}>
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Belum punya akun?{' '}
          <Link href={ROUTES.REGISTER} className="text-[var(--accent)] hover:underline font-medium">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
