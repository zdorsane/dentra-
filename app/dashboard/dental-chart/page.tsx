'use client';

import { Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Odontogram } from '@/components/dental/Odontogram';
import { ToothDetailPanel } from '@/components/dental/ToothDetailPanel';
import { DataCard } from '@/components/ui/DataCard';
import { SelectInput } from '@/components/ui/Form';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { StatusPill } from '@/components/ui/StatusPill';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/lib/store';
import { TOOTH_CONDITION_STYLE, formatDate, patientTone } from '@/lib/utils';
import type { Tooth, ToothCondition } from '@/types';

export default function DentalChartPage() {
  const { patients, teeth, loading, error, reload, updateTooth } = useStore();
  const { toast } = useToast();

  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [selected, setSelected] = useState<number | null>(null);

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId],
  );

  const patientTeeth = useMemo(
    () => teeth.filter((t) => t.patientId === patientId),
    [teeth, patientId],
  );

  const activeTooth = useMemo(
    () => patientTeeth.find((t) => t.number === selected) ?? null,
    [patientTeeth, selected],
  );

  /** Teeth that need clinical attention, surfaced beside the chart. */
  const attention = useMemo(
    () =>
      patientTeeth
        .filter(
          (t) =>
            t.status === 'TREATMENT REQUIRED' ||
            t.status === 'IN TREATMENT' ||
            t.status === 'MONITOR',
        )
        .sort((a, b) => a.number - b.number),
    [patientTeeth],
  );

  const conditionCounts = useMemo(() => {
    const counts = new Map<ToothCondition, number>();
    patientTeeth.forEach((tooth) => {
      counts.set(tooth.condition, (counts.get(tooth.condition) ?? 0) + 1);
    });
    return counts;
  }, [patientTeeth]);

  const onSave = (tooth: Tooth) => {
    updateTooth(tooth);
    setSelected(null);
    toast({
      title: 'CHART UPDATED',
      description: `Tooth ${tooth.number} recorded as ${tooth.condition.toLowerCase()}.`,
    });
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="profile" label="Loading dental chart" />;

  if (patients.length === 0) {
    return (
      <div className="border border-[rgba(43,48,51,0.12)] bg-white">
        <EmptyState
          title="NO PATIENTS"
          description="Add a patient to start charting."
          icon={Users}
          actionLabel="ADD PATIENT"
          actionHref="/dashboard/patients"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            DENTAL CHART
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            Interactive odontogram in FDI notation. Select any tooth to record its
            condition.
          </p>
        </div>

        <SelectInput
          label=""
          value={patientId}
          onChange={(event) => {
            setPatientId(event.target.value);
            setSelected(null);
          }}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.fullName} · ${p.fileNumber}`,
          }))}
          className="min-w-[240px] text-[11px] font-bold"
        />
      </div>

      {/* ---------------- patient strip ---------------- */}
      {patient && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-[rgba(43,48,51,0.12)] bg-white px-5 py-4">
          <Link
            href={`/dashboard/patients/${patient.id}`}
            className="group flex items-center gap-3.5"
          >
            <span className="dt-chamfer-xs flex h-11 w-11 shrink-0 items-center justify-center bg-[#1A1C1E] text-[12px] font-bold text-white">
              {patient.avatarInitials}
            </span>
            <span>
              <span className="block text-[14px] font-bold uppercase tracking-[0.03em] text-[#2B3033] group-hover:text-[#0FA3C2]">
                {patient.fullName}
              </span>
              <span className="dt-mono mt-0.5 block text-[11px] text-[#6B6F72]">
                {patient.fileNumber} · {patient.age}Y · LAST VISIT{' '}
                {formatDate(patient.lastVisit)}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <TechnicalLabel label="TEETH CHARTED" value={String(patientTeeth.length)} />
            <TechnicalLabel label="ATTENTION" value={String(attention.length)} dot />
            <StatusPill label={patient.status} tone={patientTone(patient.status)} />
          </div>
        </div>
      )}

      {/* ---------------- chart ---------------- */}
      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <DataCard
          title="ODONTOGRAM"
          eyebrow="FDI NOTATION"
          action={<TechnicalLabel label="SYSTEM" value="01" dot />}
        >
          <Odontogram
            teeth={patientTeeth}
            selectedNumber={selected}
            onSelect={setSelected}
          />
        </DataCard>

        {/* Side summary */}
        <div className="space-y-3">
          <DataCard title="REQUIRES ATTENTION" eyebrow={`${attention.length} TEETH`} padded={false}>
            {attention.length === 0 ? (
              <EmptyState
                title="CHART IS CLEAR"
                description="No teeth are flagged for treatment or monitoring."
                compact
              />
            ) : (
              <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
                {attention.map((tooth) => (
                  <li key={tooth.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(tooth.number)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgba(21,188,223,0.06)]"
                    >
                      <span
                        className="dt-mono flex h-7 w-7 shrink-0 items-center justify-center border text-[11px] font-bold"
                        style={{
                          borderColor: TOOTH_CONDITION_STYLE[tooth.condition].stroke,
                          background:
                            tooth.condition === 'MISSING'
                              ? 'transparent'
                              : TOOTH_CONDITION_STYLE[tooth.condition].fill,
                          color:
                            tooth.condition === 'IMPLANT' ? '#FFFFFF' : '#1A1C1E',
                        }}
                      >
                        {tooth.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-bold text-[#2B3033]">
                          {tooth.condition}
                        </span>
                        <span className="block truncate text-[10px] text-[#6B6F72]">
                          {tooth.treatment || tooth.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-[8.5px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
                        {tooth.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </DataCard>

          <DataCard title="CONDITION SUMMARY" eyebrow="DISTRIBUTION">
            <ul className="space-y-2.5">
              {Array.from(conditionCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([condition, count]) => (
                  <li key={condition} className="flex items-center gap-3">
                    <span
                      className="h-[11px] w-[11px] shrink-0 border"
                      style={{
                        background:
                          condition === 'MISSING'
                            ? 'transparent'
                            : TOOTH_CONDITION_STYLE[condition].fill,
                        borderColor: TOOTH_CONDITION_STYLE[condition].stroke,
                      }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
                      {condition}
                    </span>
                    <span className="dt-mono text-[12px] font-bold text-[#1A1C1E]">
                      {count}
                    </span>
                  </li>
                ))}
            </ul>
          </DataCard>
        </div>
      </div>

      <ToothDetailPanel
        tooth={activeTooth}
        onClose={() => setSelected(null)}
        onSave={onSave}
      />
    </div>
  );
}
