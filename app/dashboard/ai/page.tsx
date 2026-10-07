'use client';

import { useMemo } from 'react';

import { AIChat } from '@/components/ai/AIChat';
import { DataCard } from '@/components/ui/DataCard';
import { ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { AI_SUGGESTED_PROMPTS } from '@/lib/ai';
import type { ClinicSnapshot } from '@/lib/ai';
import { dailySeries } from '@/lib/mock-data';
import { useStore } from '@/lib/store';

export default function AIPage() {
  const {
    today,
    clinic,
    clinicStats,
    patients,
    appointments,
    treatments,
    inventory,
    invoices,
    loading,
    error,
    reload,
  } = useStore();

  /**
   * The context handed to the assistant. When a hosted model is connected this
   * is the payload that becomes its prompt context.
   */
  const snapshot = useMemo<ClinicSnapshot>(
    () => ({
      today,
      clinicName: clinic.name,
      currency: clinic.currency,
      patients,
      appointments,
      treatments,
      inventory,
      invoices,
      series: dailySeries,
      activePatientCount: clinicStats.activePatients,
    }),
    [
      today,
      clinic,
      clinicStats,
      patients,
      appointments,
      treatments,
      inventory,
      invoices,
    ],
  );

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="chat" label="Loading DENTRA AI" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            <span className="block">DENTRA AI</span>
          </h2>
          <p className="mt-2 max-w-[560px] text-[13px] leading-[1.6] text-[#6B6F72]">
            An administrative copilot with your clinic&rsquo;s own data loaded.
            Ask about the schedule, recalls, stock levels, revenue or open
            treatment plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TechnicalLabel label="AI ENGINE" value="ACTIVE" dot />
          <TechnicalLabel label="DATA" value="SYNCHRONIZED" />
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_290px]">
        <AIChat snapshot={snapshot} />

        {/* ---------------- side rail ---------------- */}
        <div className="space-y-3">
          <DataCard title="TRY ASKING" eyebrow="EXAMPLE PROMPTS" padded={false}>
            <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
              {AI_SUGGESTED_PROMPTS.map((prompt) => (
                <li
                  key={prompt}
                  className="px-4 py-3 text-[12px] leading-[1.55] text-[#6B6F72]"
                >
                  <span className="mr-2 text-[#15BCDF]" aria-hidden="true">
                    ›
                  </span>
                  {prompt}
                </li>
              ))}
            </ul>
          </DataCard>

          <DataCard title="CONTEXT LOADED" eyebrow="SNAPSHOT">
            <dl className="space-y-2.5">
              {[
                { label: 'PATIENTS', value: String(patients.length) },
                { label: 'APPOINTMENTS', value: String(appointments.length) },
                { label: 'TREATMENTS', value: String(treatments.length) },
                { label: 'PRODUCTS', value: String(inventory.length) },
                { label: 'INVOICES', value: String(invoices.length) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-3"
                >
                  <dt className="dt-label text-[9px]">{row.label}</dt>
                  <dd className="dt-mono text-[13px] font-bold text-[#1A1C1E]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </DataCard>

          <DataCard title="SCOPE" eyebrow="WHAT I DO NOT DO">
            <p className="text-[12px] leading-[1.65] text-[#6B6F72]">
              DENTRA AI reports what is recorded in your clinic&rsquo;s data. It
              does not interpret symptoms, offer a diagnosis, or recommend
              clinical treatment — those remain decisions for the treating
              practitioner.
            </p>
          </DataCard>
        </div>
      </div>
    </div>
  );
}
