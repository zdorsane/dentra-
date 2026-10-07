'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { Checkbox, TextInput } from '@/components/ui/Form';
import { signIn } from '@/lib/auth';
import { DEMO_CREDENTIALS } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn({ email, password, remember });

    if (result.ok) {
      router.push('/dashboard');
      return;
    }

    setError(result.error ?? 'Unable to sign in.');
    setPending(false);
  };

  return (
    <AuthLayout
      headline={['THE', 'INTELLIGENT', 'DENTAL', 'PLATFORM']}
      title="LOGIN"
      subtitle="Sign in to your clinic workspace."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <TextInput
          label="EMAIL"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <TextInput
          label="PASSWORD"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <Link
            href="/forgot-password"
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6F72] transition-colors hover:text-[#0FA3C2]"
          >
            FORGOT PASSWORD
          </Link>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2.5 border-l-2 border-[#B03A34] bg-[rgba(176,58,52,0.06)] px-3.5 py-3 text-[12px] leading-[1.6] text-[#A33A35]"
          >
            <AlertTriangle
              size={14}
              strokeWidth={1.8}
              className="mt-[1px] shrink-0"
              aria-hidden="true"
            />
            {error}
          </p>
        )}

        <ChamferButton type="submit" fullWidth disabled={pending}>
          {pending ? 'SIGNING IN…' : 'LOGIN'}
        </ChamferButton>
      </form>

      {/* Demo credentials */}
      <div className="mt-7 border border-[rgba(21,188,223,0.35)] bg-[rgba(21,188,223,0.06)] px-4 py-3.5">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0FA3C2]">
          DEMO ACCESS
        </div>
        <p className="dt-mono mt-2 text-[12px] text-[#2B3033]">
          {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </p>
        <p className="mt-2 text-[11px] leading-[1.55] text-[#6B6F72]">
          No backend required — DENTRA runs on a local demo dataset.
        </p>
      </div>

      <p className="mt-7 border-t border-[rgba(43,48,51,0.12)] pt-6 text-[12px] text-[#6B6F72]">
        Don&rsquo;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold uppercase tracking-[0.06em] text-[#0FA3C2] hover:text-[#15BCDF]"
        >
          CREATE ACCOUNT
        </Link>
      </p>
    </AuthLayout>
  );
}
