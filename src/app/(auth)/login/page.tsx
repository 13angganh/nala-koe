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
import { NalaKoeLogo } from '@/components/shared/nalakoe-logo';

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
   *
   * Returns whether the cookie was actually confirmed set. Previously this
   * didn't check response.ok at all, so a failed session-cookie POST (500
   * from a misconfigured Admin SDK, a network blip, etc.) was silently
   * treated as success — the code would call router.replace(from) anyway,
   * proxy.ts's middleware would find no valid session cookie for that next
   * request, and redirect straight back to /login. From the user's
   * perspective: click "Masuk", spinner runs, lands back on the login
   * page as if nothing happened. This return value is what the fix below
   * uses to stop that from happening silently.
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

  /**
   * Root cause of the reported "login macet — hanya muter, tetap di
   * halaman login": this is the documented "cookie race condition" for
   * Next.js App Router (well-established pattern — a fetch() response
   * resolving does not guarantee the browser has finished committing its
   * Set-Cookie header before the very next navigation's request goes out).
   * router.replace(from) right after the session POST could reach
   * proxy.ts's middleware before that cookie was actually attached to the
   * request, so middleware saw no session, and bounced the user straight
   * back to /login — with isSubmitting/isGoogleLoading already reset to
   * false by the time the (re-mounted) login page rendered again, which
   * is what read as "spinner just stops, still on login" rather than an
   * error.
   *
   * router.refresh() forces the App Router to re-fetch server-rendered
   * data (and, critically, re-evaluate middleware) for the current route
   * using the cookie the browser has by that point — giving the
   * just-committed cookie a chance to actually be picked up — before we
   * navigate away. This is the standard fix for this exact class of bug.
   */
  const goToDestination = () => {
    router.refresh();
    router.replace(from);
  };

  const onSubmit = async (data: LoginInput) => {
    const result = await loginWithEmail(data.email, data.password);
    if (result.error === null) {
      const sessionOk = await setServerSession();
      if (!sessionOk) {
        toast.error('Berhasil masuk, tapi gagal membuat sesi. Coba lagi.');
        return;
      }
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
