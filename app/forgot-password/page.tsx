'use client';

import { AlertTriangle, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { TextInput } from '@/components/ui/Form';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await requestPasswordReset(email);

    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error ?? 'Unable to send the reset link.');
    }
    setPending(false);
  };

  return (
    <AuthLayout
      headline={['RESET', 'YOUR', 'ACCESS']}
      title="FORGOT PASSWORD"
      subtitle="Enter your email and we'll send a reset link."
    >
      {sent ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3 border border-[rgba(21,188,223,0.4)] bg-[rgba(21,188,223,0.07)] px-4 py-4">
            <span
              className="dt-chamfer-xs mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-[#15BCDF]"
              aria-hidden="true"
            >
              <Check size={13} strokeWidth={2.6} className="text-[#1A1C1E]" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#2B3033]">
                CHECK YOUR INBOX
              </p>
              <p className="mt-1.5 text-[12px] leading-[1.6] text-[#6B6F72]">
                If an account exists for{' '}
                <span className="font-bold text-[#2B3033]">{email}</span>, a reset
                link is on its way.
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-[1.6] text-[#6B6F72]">
            No email arrives in demo mode — there is no mail service connected.
            Sign in with the demo credentials instead.
          </p>

          <ChamferButton href="/login" variant="secondary" fullWidth>
            BACK TO LOGIN
          </ChamferButton>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <TextInput
            label="EMAIL"
            type="email"
            autoComplete="email"
            required
            placeholder="you@clinic.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
          />

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
            {pending ? 'SENDING…' : 'SEND RESET LINK'}
          </ChamferButton>
        </form>
      )}

      <p className="mt-7 border-t border-[rgba(43,48,51,0.12)] pt-6 text-[12px] text-[#6B6F72]">
        Remembered it?{' '}
        <Link
          href="/login"
          className="font-bold uppercase tracking-[0.06em] text-[#0FA3C2] hover:text-[#15BCDF]"
        >
          LOGIN
        </Link>
      </p>
    </AuthLayout>
  );
}
