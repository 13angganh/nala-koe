'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendResetEmail } from '@/services/auth.service';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth.schema';
import { ROUTES } from '@/constants/routes';
import { NalaKoeLogo } from '@/components/shared/nalakoe-logo';

// Route was linked from login/page.tsx ("Lupa password?") but this page
// never existed — reported as "klik Lupa password tidak terjadi apa-apa".
// The backing pieces (sendResetEmail in auth.service.ts, forgotPasswordSchema
// in auth.schema.ts) were already built and just never wired to a page.
export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const result = await sendResetEmail(data.email);
    if (result.error === null) {
      setSentTo(data.email);
      setIsSent(true);
    } else {
      // Firebase's sendPasswordResetEmail intentionally doesn't
      // distinguish "email not found" from success in most configurations
      // (to avoid leaking which emails have accounts) — but if
      // mapFirebaseError does surface a specific message (rate limiting,
      // network, etc.), show it rather than silently doing nothing.
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
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Lupa Password</h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Masukkan email akunmu, kami kirim tautan untuk atur ulang password.
          </p>
        </div>

        {isSent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              <MailCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Kalau <span className="font-medium text-[var(--text-primary)]">{sentTo}</span> terdaftar,
              kami sudah kirim tautan reset password ke email itu. Cek juga folder spam kalau belum terlihat.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Kembali ke halaman masuk
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">Email</label>
              <Input id="email" type="email" autoComplete="email" placeholder="kamu@email.com"
                error={Boolean(errors.email)} disabled={isSubmitting} {...register('email')} />
              {errors.email && <p className="text-sm text-[var(--error)]" role="alert">{errors.email.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              Kirim tautan reset
            </Button>

            <Link
              href={ROUTES.LOGIN}
              className="flex items-center justify-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Kembali ke halaman masuk
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
