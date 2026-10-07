'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Plan {
  number: string;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    number: '01',
    name: 'SOLO',
    price: '€79',
    cadence: 'PER MONTH',
    summary: 'For a single practitioner running their own list.',
    features: [
      '1 practitioner',
      'Patients & dental charts',
      'Appointments & treatments',
      'Basic inventory',
      'Email support',
    ],
  },
  {
    number: '02',
    name: 'CLINIC',
    price: '€189',
    cadence: 'PER MONTH',
    summary: 'For multi-chair practices with a front desk and a stock room.',
    features: [
      'Up to 8 staff members',
      'Everything in Solo',
      'Billing & invoicing',
      'Analytics & reporting',
      'DENTRA AI copilot',
      'Priority support',
    ],
    featured: true,
  },
  {
    number: '03',
    name: 'GROUP',
    price: 'CUSTOM',
    cadence: 'ANNUAL',
    summary: 'For multi-site groups that need central oversight.',
    features: [
      'Unlimited staff & locations',
      'Everything in Clinic',
      'Cross-site analytics',
      'Role-based access control',
      'Data migration & onboarding',
      'Dedicated account manager',
    ],
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative w-full overflow-hidden bg-[#F7F6F8]"
      style={{
        padding: 'clamp(70px,9vw,130px) clamp(20px,5vw,48px) clamp(70px,9vw,130px)',
      }}
    >
      <div className="mx-auto w-full max-w-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <TechnicalLabel label="PRICING" value="07" className="mb-6" />
            <SectionHeading
              id="pricing-heading"
              fontSize="clamp(38px, 6.5vw, 72px)"
              lines={[
                { text: 'ONE' },
                { text: 'PLATFORM' },
                { text: 'ONE PRICE', accent: true, indent: 'min(120px, 14vw)' },
              ]}
            />
          </div>

          <p
            className="max-w-[400px] leading-[1.7] text-[#6B6F72]"
            style={{ fontSize: 'clamp(14px, 1.6vw, 17px)' }}
          >
            Every plan includes the full clinical core. No per-record fees, no
            charge for the patients you already have.
          </p>
        </motion.div>

        {/* ---------- Plans ---------- */}
        <div className="mt-16 grid gap-3 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              className={cn(
                'relative flex flex-col border p-7',
                plan.featured
                  ? 'dt-chamfer border-white/10 bg-[#1A1C1E]'
                  : 'border-[rgba(43,48,51,0.12)] bg-white',
              )}
            >
              {plan.featured && (
                <span
                  className="absolute right-0 top-0 h-[3px] w-14 bg-[#15BCDF]"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'dt-mono text-[11px] font-bold tracking-[0.18em]',
                    plan.featured ? 'text-[#15BCDF]' : 'text-[#15BCDF]',
                  )}
                >
                  {plan.number}
                </span>
                {plan.featured && (
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#15BCDF]">
                    MOST CHOSEN
                  </span>
                )}
              </div>

              <h3
                className={cn(
                  'mt-6 text-[24px] font-bold uppercase tracking-[0.04em]',
                  plan.featured ? 'text-white' : 'text-[#2B3033]',
                )}
              >
                {plan.name}
              </h3>

              <p
                className={cn(
                  'mt-2.5 text-[13px] leading-[1.6]',
                  plan.featured ? 'text-white/55' : 'text-[#6B6F72]',
                )}
              >
                {plan.summary}
              </p>

              <div
                className={cn(
                  'mt-7 flex items-baseline gap-2 border-t pt-6',
                  plan.featured ? 'border-white/10' : 'border-[rgba(43,48,51,0.1)]',
                )}
              >
                <span
                  className={cn(
                    'dt-mono text-[36px] font-bold leading-none',
                    plan.featured ? 'text-white' : 'text-[#1A1C1E]',
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-[0.16em]',
                    plan.featured ? 'text-white/40' : 'text-[#6B6F72]',
                  )}
                >
                  {plan.cadence}
                </span>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      'flex items-start gap-2.5 text-[12px] leading-[1.5]',
                      plan.featured ? 'text-white/70' : 'text-[#6B6F72]',
                    )}
                  >
                    <Check
                      size={13}
                      strokeWidth={2}
                      className="mt-[3px] shrink-0 text-[#15BCDF]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <ChamferButton
                href="/register"
                size="sm"
                variant={plan.featured ? 'primary' : 'secondary'}
                fullWidth
                className="mt-8"
              >
                {plan.price === 'CUSTOM' ? 'CONTACT SALES' : 'START FREE TRIAL'}
              </ChamferButton>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
