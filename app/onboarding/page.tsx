'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { Checkbox, SelectInput, TextInput } from '@/components/ui/Form';
import { LogoMark } from '@/components/ui/Logo';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { clinic as demoClinic } from '@/lib/mock-data';
import { cn, createId } from '@/lib/utils';
import type { StaffRole, WorkingHours } from '@/types';

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { id: 1, label: 'CLINIC' },
  { id: 2, label: 'DENTIST' },
  { id: 3, label: 'LOCATION' },
  { id: 4, label: 'WORKING HOURS' },
  { id: 5, label: 'SERVICES' },
  { id: 6, label: 'STAFF' },
  { id: 7, label: 'COMPLETE' },
];

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const SERVICE_OPTIONS = [
  'General dentistry',
  'Endodontics',
  'Implantology',
  'Orthodontics',
  'Periodontics',
  'Prosthodontics',
  'Pediatric dentistry',
  'Teeth whitening',
  'Oral surgery',
  'Emergency care',
];

const ROLES: StaffRole[] = ['DENTIST', 'ASSISTANT', 'RECEPTIONIST', 'MANAGER'];

const DEFAULT_HOURS: WorkingHours[] = [
  { day: 1, open: '09:00', close: '18:00', closed: false },
  { day: 2, open: '09:00', close: '18:00', closed: false },
  { day: 3, open: '09:00', close: '18:00', closed: false },
  { day: 4, open: '09:00', close: '18:00', closed: false },
  { day: 5, open: '09:00', close: '17:00', closed: false },
  { day: 6, open: '09:00', close: '13:00', closed: false },
  { day: 0, open: '09:00', close: '13:00', closed: true },
];

interface Invite {
  id: string;
  email: string;
  role: StaffRole;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [state, setState] = useState({
    clinicName: '',
    clinicType: 'General practice',
    chairs: '3',
    dentistName: '',
    licenseNumber: '',
    specialty: 'General dentistry',
    addressLine: '',
    city: '',
    postalCode: '',
    country: 'France',
    timezone: 'Europe/Paris',
    currency: 'EUR',
  });
  const [hours, setHours] = useState<WorkingHours[]>(DEFAULT_HOURS);
  const [services, setServices] = useState<string[]>([
    'General dentistry',
    'Endodontics',
  ]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('DENTIST');

  const set = (key: keyof typeof state, value: string) =>
    setState((current) => ({ ...current, [key]: value }));

  const setHour = (day: number, patch: Partial<WorkingHours>) =>
    setHours((current) =>
      current.map((h) => (h.day === day ? { ...h, ...patch } : h)),
    );

  const toggleService = (service: string) =>
    setServices((current) =>
      current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service],
    );

  const addInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (invites.some((i) => i.email === email)) return;

    setInvites((current) => [...current, { id: createId('inv'), email, role: inviteRole }]);
    setInviteEmail('');
  };

  /** Steps 1–3 require input; the rest have workable defaults. */
  const canAdvance = (): boolean => {
    if (step === 1) return state.clinicName.trim().length > 0;
    if (step === 2) return state.dentistName.trim().length > 0;
    if (step === 3) return state.city.trim().length > 0;
    if (step === 5) return services.length > 0;
    return true;
  };

  const next = () => {
    if (step < STEPS.length) setStep(step + 1);
  };

  const finish = () => {
    toast({
      title: 'CLINIC READY',
      description: `${state.clinicName || 'Your clinic'} has been configured.`,
    });
    router.push('/dashboard');
  };

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-svh bg-[#F2F1F0]">
      {/* ---------------- header ---------------- */}
      <header className="border-b border-[rgba(43,48,51,0.1)] bg-[#F2F1F0]/92 px-5 py-5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-3">
            <LogoMark size={32} />
            <span
              className="font-normal leading-none tracking-[-0.5px] text-[#1A1C1E]"
              style={{ fontSize: 24 }}
            >
              DENTRA
            </span>
          </span>

          <TechnicalLabel
            label="SETUP"
            value={`STEP ${step} / ${STEPS.length}`}
            dot
          />
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
        {/* ---------------- progress ---------------- */}
        <div className="mb-10">
          <div
            className="h-[3px] w-full bg-[rgba(43,48,51,0.1)]"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label="Onboarding progress"
          >
            <motion.span
              className="block h-full bg-[#15BCDF]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          </div>

          <ol className="dt-scroll mt-4 flex gap-1 overflow-x-auto">
            {STEPS.map((entry) => (
              <li key={entry.id} className="flex shrink-0 items-center gap-2 pr-4">
                <span
                  className={cn(
                    'flex h-[18px] w-[18px] items-center justify-center border text-[9px] font-bold',
                    entry.id < step
                      ? 'border-[#0FA3C2] bg-[#15BCDF] text-[#1A1C1E]'
                      : entry.id === step
                        ? 'border-[#0FA3C2] bg-white text-[#0FA3C2]'
                        : 'border-[rgba(43,48,51,0.2)] bg-white text-[#6B6F72]',
                  )}
                  aria-hidden="true"
                >
                  {entry.id < step ? <Check size={10} strokeWidth={3} /> : entry.id}
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em]',
                    entry.id === step ? 'text-[#2B3033]' : 'text-[#6B6F72]',
                  )}
                >
                  {entry.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------------- panel ---------------- */}
        <div className="dt-chamfer-sm border border-[rgba(43,48,51,0.12)] bg-white p-6 sm:p-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {/* STEP 1 — CLINIC */}
              {step === 1 && (
                <>
                  <StepHeading
                    eyebrow="STEP 01"
                    title="YOUR CLINIC"
                    description="Tell us about the practice you're setting up."
                  />
                  <div className="space-y-5">
                    <TextInput
                      label="CLINIC NAME"
                      required
                      placeholder={demoClinic.name}
                      value={state.clinicName}
                      onChange={(e) => set('clinicName', e.target.value)}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectInput
                        label="PRACTICE TYPE"
                        value={state.clinicType}
                        onChange={(e) => set('clinicType', e.target.value)}
                        options={[
                          'General practice',
                          'Specialist practice',
                          'Multi-site group',
                          'Hospital department',
                        ].map((v) => ({ value: v, label: v }))}
                      />
                      <SelectInput
                        label="NUMBER OF CHAIRS"
                        value={state.chairs}
                        onChange={(e) => set('chairs', e.target.value)}
                        options={['1', '2', '3', '4', '5', '6+'].map((v) => ({
                          value: v,
                          label: v,
                        }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2 — DENTIST */}
              {step === 2 && (
                <>
                  <StepHeading
                    eyebrow="STEP 02"
                    title="LEAD DENTIST"
                    description="The practitioner who will own this workspace."
                  />
                  <div className="space-y-5">
                    <TextInput
                      label="FULL NAME"
                      required
                      placeholder="Dr. Amel Bensaïd"
                      value={state.dentistName}
                      onChange={(e) => set('dentistName', e.target.value)}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextInput
                        label="LICENCE NUMBER"
                        placeholder="FR-DEN-000000"
                        value={state.licenseNumber}
                        onChange={(e) => set('licenseNumber', e.target.value)}
                      />
                      <SelectInput
                        label="SPECIALTY"
                        value={state.specialty}
                        onChange={(e) => set('specialty', e.target.value)}
                        options={SERVICE_OPTIONS.map((v) => ({ value: v, label: v }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3 — LOCATION */}
              {step === 3 && (
                <>
                  <StepHeading
                    eyebrow="STEP 03"
                    title="LOCATION"
                    description="Where patients will find you."
                  />
                  <div className="space-y-5">
                    <TextInput
                      label="ADDRESS"
                      placeholder="14 Rue de la République"
                      value={state.addressLine}
                      onChange={(e) => set('addressLine', e.target.value)}
                    />
                    <div className="grid gap-5 sm:grid-cols-3">
                      <TextInput
                        label="CITY"
                        required
                        placeholder="Lyon"
                        value={state.city}
                        onChange={(e) => set('city', e.target.value)}
                      />
                      <TextInput
                        label="POSTAL CODE"
                        placeholder="69002"
                        value={state.postalCode}
                        onChange={(e) => set('postalCode', e.target.value)}
                      />
                      <TextInput
                        label="COUNTRY"
                        value={state.country}
                        onChange={(e) => set('country', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectInput
                        label="TIMEZONE"
                        value={state.timezone}
                        onChange={(e) => set('timezone', e.target.value)}
                        options={[
                          'Europe/Paris',
                          'Europe/London',
                          'Europe/Madrid',
                          'Africa/Algiers',
                        ].map((v) => ({ value: v, label: v }))}
                      />
                      <SelectInput
                        label="CURRENCY"
                        value={state.currency}
                        onChange={(e) => set('currency', e.target.value)}
                        options={[
                          { value: 'EUR', label: 'EUR (€)' },
                          { value: 'USD', label: 'USD ($)' },
                          { value: 'GBP', label: 'GBP (£)' },
                        ]}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4 — WORKING HOURS */}
              {step === 4 && (
                <>
                  <StepHeading
                    eyebrow="STEP 04"
                    title="WORKING HOURS"
                    description="When the clinic is open for appointments."
                  />
                  <ul className="space-y-2.5">
                    {hours.map((entry) => (
                      <li
                        key={entry.day}
                        className="flex flex-wrap items-center gap-3 border-b border-[rgba(43,48,51,0.07)] pb-2.5 last:border-0"
                      >
                        <span className="w-[86px] shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2B3033]">
                          {DAY_NAMES[entry.day].slice(0, 3)}
                        </span>

                        <Checkbox
                          label="Open"
                          checked={!entry.closed}
                          onChange={(e) =>
                            setHour(entry.day, { closed: !e.target.checked })
                          }
                        />

                        <div className="ml-auto flex items-center gap-2">
                          <input
                            type="time"
                            aria-label={`${DAY_NAMES[entry.day]} opening time`}
                            className="dt-input h-9 w-[104px] py-0 text-[12px]"
                            value={entry.open}
                            disabled={entry.closed}
                            onChange={(e) =>
                              setHour(entry.day, { open: e.target.value })
                            }
                          />
                          <span className="text-[#6B6F72]" aria-hidden="true">
                            –
                          </span>
                          <input
                            type="time"
                            aria-label={`${DAY_NAMES[entry.day]} closing time`}
                            className="dt-input h-9 w-[104px] py-0 text-[12px]"
                            value={entry.close}
                            disabled={entry.closed}
                            onChange={(e) =>
                              setHour(entry.day, { close: e.target.value })
                            }
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* STEP 5 — SERVICES */}
              {step === 5 && (
                <>
                  <StepHeading
                    eyebrow="STEP 05"
                    title="SERVICES"
                    description="Select everything your practice offers."
                  />
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map((service) => {
                      const active = services.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          aria-pressed={active}
                          className={cn(
                            'dt-chamfer-xs inline-flex items-center gap-2 border px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors',
                            active
                              ? 'border-[#0FA3C2] bg-[#15BCDF] text-[#1A1C1E]'
                              : 'border-[rgba(43,48,51,0.16)] bg-white text-[#6B6F72] hover:border-[#15BCDF]',
                          )}
                        >
                          {active && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                          {service}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-5 text-[12px] text-[#6B6F72]">
                    {services.length} selected
                  </p>
                </>
              )}

              {/* STEP 6 — STAFF */}
              {step === 6 && (
                <>
                  <StepHeading
                    eyebrow="STEP 06"
                    title="INVITE YOUR TEAM"
                    description="Add colleagues now, or skip and do it later."
                  />

                  <div className="flex flex-wrap items-end gap-3">
                    <TextInput
                      label="EMAIL"
                      type="email"
                      placeholder="colleague@clinic.com"
                      value={inviteEmail}
                      containerClassName="min-w-[200px] flex-1"
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInvite();
                        }
                      }}
                    />
                    <SelectInput
                      label="ROLE"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                      options={ROLES.map((r) => ({ value: r, label: r }))}
                      containerClassName="w-[160px]"
                    />
                    <ChamferButton size="sm" onClick={addInvite}>
                      <Plus size={13} strokeWidth={2} aria-hidden="true" />
                      ADD
                    </ChamferButton>
                  </div>

                  {invites.length > 0 && (
                    <ul className="mt-6 divide-y divide-[rgba(43,48,51,0.07)] border border-[rgba(43,48,51,0.1)]">
                      {invites.map((invite) => (
                        <li
                          key={invite.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <span className="min-w-0 flex-1 truncate text-[12px] text-[#2B3033]">
                            {invite.email}
                          </span>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
                            {invite.role}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setInvites((c) => c.filter((i) => i.id !== invite.id))
                            }
                            aria-label={`Remove ${invite.email}`}
                            className="shrink-0 p-1 text-[#6B6F72] hover:text-[#B03A34]"
                          >
                            <X size={13} strokeWidth={2} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* STEP 7 — COMPLETE */}
              {step === 7 && (
                <>
                  <StepHeading
                    eyebrow="STEP 07"
                    title="YOU'RE READY"
                    description="Here's how your clinic is configured."
                  />

                  <dl className="grid gap-px border border-[rgba(43,48,51,0.1)] bg-[rgba(43,48,51,0.08)] sm:grid-cols-2">
                    {[
                      { label: 'CLINIC', value: state.clinicName || '—' },
                      { label: 'LEAD DENTIST', value: state.dentistName || '—' },
                      {
                        label: 'LOCATION',
                        value:
                          [state.city, state.country].filter(Boolean).join(', ') || '—',
                      },
                      { label: 'CHAIRS', value: state.chairs },
                      {
                        label: 'OPEN DAYS',
                        value: `${hours.filter((h) => !h.closed).length} per week`,
                      },
                      { label: 'SERVICES', value: `${services.length} selected` },
                      { label: 'TEAM INVITES', value: `${invites.length} pending` },
                      { label: 'CURRENCY', value: state.currency },
                    ].map((row) => (
                      <div key={row.label} className="bg-white px-4 py-3.5">
                        <dt className="dt-label text-[9px]">{row.label}</dt>
                        <dd className="mt-1.5 truncate text-[13px] font-bold text-[#2B3033]">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-6 text-[12px] leading-[1.65] text-[#6B6F72]">
                    DENTRA is running in demo mode, so your workspace opens with a
                    representative clinic dataset already loaded — patients,
                    schedule, inventory and billing — ready to explore.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ---------------- controls ---------------- */}
          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(43,48,51,0.1)] pt-6">
            <ChamferButton
              variant="secondary"
              size="sm"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
              BACK
            </ChamferButton>

            <div className="flex items-center gap-3">
              {step < STEPS.length && step >= 4 && (
                <button
                  type="button"
                  onClick={next}
                  className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B6F72] transition-colors hover:text-[#2B3033]"
                >
                  SKIP
                </button>
              )}

              {step < STEPS.length ? (
                <ChamferButton size="sm" onClick={next} disabled={!canAdvance()}>
                  CONTINUE
                  <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                </ChamferButton>
              ) : (
                <ChamferButton size="sm" onClick={finish}>
                  ENTER DASHBOARD
                  <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                </ChamferButton>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <TechnicalLabel label={eyebrow} className="mb-3" />
      <h1
        className="dt-stair text-[#2B3033]"
        style={{ fontSize: 'clamp(24px, 3.6vw, 36px)' }}
      >
        {title}
      </h1>
      <p className="mt-3 text-[13px] leading-[1.65] text-[#6B6F72]">
        {description}
      </p>
    </div>
  );
}
