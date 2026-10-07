'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { SelectInput, TextInput } from '@/components/ui/Form';
import { passwordIssues, signUp, validateEmail } from '@/lib/auth';

const COUNTRIES = [
  'France',
  'Algeria',
  'Morocco',
  'Tunisia',
  'Belgium',
  'Switzerland',
  'Spain',
  'Italy',
  'Germany',
  'United Kingdom',
  'Canada',
  'Other',
];

interface FormState {
  fullName: string;
  email: string;
  password: string;
  clinicName: string;
  country: string;
  phone: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    clinicName: '',
    country: 'France',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setError(null);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) next.fullName = 'Required';
    if (!validateEmail(form.email)) next.email = 'Enter a valid email address';

    const issues = passwordIssues(form.password);
    if (issues.length > 0) next.password = issues.join(' · ');

    if (!form.clinicName.trim()) next.clinicName = 'Required';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setPending(true);
    const result = await signUp(form);

    if (result.ok) {
      router.push('/onboarding');
      return;
    }

    setError(result.error ?? 'Unable to create your account.');
    setPending(false);
  };

  return (
    <AuthLayout
      headline={['START', 'YOUR', 'DIGITAL', 'CLINIC']}
      title="CREATE ACCOUNT"
      subtitle="Set up your clinic workspace in under a minute."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <TextInput
          label="FULL NAME"
          autoComplete="name"
          required
          placeholder="Dr. Amel Bensaïd"
          value={form.fullName}
          error={errors.fullName}
          onChange={(event) => set('fullName', event.target.value)}
        />

        <TextInput
          label="EMAIL"
          type="email"
          autoComplete="email"
          required
          placeholder="you@clinic.com"
          value={form.email}
          error={errors.email}
          onChange={(event) => set('email', event.target.value)}
        />

        <TextInput
          label="PASSWORD"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 6 characters, including a letter."
          value={form.password}
          error={errors.password}
          onChange={(event) => set('password', event.target.value)}
        />

        <TextInput
          label="CLINIC NAME"
          required
          placeholder="Centre Dentaire Aurora"
          value={form.clinicName}
          error={errors.clinicName}
          onChange={(event) => set('clinicName', event.target.value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectInput
            label="COUNTRY"
            value={form.country}
            onChange={(event) => set('country', event.target.value)}
            options={COUNTRIES.map((c) => ({ value: c, label: c }))}
          />
          <TextInput
            label="PHONE"
            type="tel"
            autoComplete="tel"
            placeholder="+33 6 00 00 00 00"
            value={form.phone}
            onChange={(event) => set('phone', event.target.value)}
          />
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
          {pending ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
        </ChamferButton>

        <p className="text-[11px] leading-[1.6] text-[#6B6F72]">
          By creating an account you agree to the DENTRA terms of service and
          privacy policy.
        </p>
      </form>

      <p className="mt-7 border-t border-[rgba(43,48,51,0.12)] pt-6 text-[12px] text-[#6B6F72]">
        Already have an account?{' '}
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
