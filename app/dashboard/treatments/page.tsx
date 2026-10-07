'use client';

import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { TreatmentTimeline } from '@/components/treatments/TreatmentTimeline';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { SearchInput, SelectInput, TextArea, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { StatusPill } from '@/components/ui/StatusPill';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { clinic } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import {
  addDays,
  cn,
  createId,
  formatCurrency,
  formatDate,
  sum,
  treatmentTone,
} from '@/lib/utils';
import type { Treatment, TreatmentStatus } from '@/types';

const STATUSES: TreatmentStatus[] = [
  'PROPOSED',
  'ACCEPTED',
  'IN PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const CATEGORIES = [
  'General dentistry',
  'Endodontics',
  'Implantology',
  'Orthodontics',
  'Periodontics',
  'Prosthodontics',
  'Oral surgery',
  'Cosmetic',
];

/** Default staged plans offered when creating a treatment. */
const STEP_TEMPLATES: Record<string, string[]> = {
  'General dentistry': ['Consultation', 'Restoration', 'Polish & review'],
  Endodontics: [
    'Consultation',
    'Diagnosis',
    'Canal preparation',
    'Obturation',
    'Coronal restoration',
  ],
  Implantology: [
    'Consultation',
    'CBCT planning',
    'Implant placement',
    'Healing review',
    'Final crown',
  ],
  Orthodontics: ['Consultation', 'Digital scan', 'Appliance fitting', 'Review', 'Retention'],
  Periodontics: ['Consultation', 'Full-mouth debridement', 'Quadrant therapy', 'Recall'],
  Prosthodontics: ['Consultation', 'Preparation', 'Impression', 'Fitting', 'Follow-up'],
  'Oral surgery': ['Consultation', 'Radiographic assessment', 'Procedure', 'Review'],
  Cosmetic: ['Consultation', 'Preparation', 'Treatment session', 'Review'],
};

export default function TreatmentsPage() {
  const {
    treatments,
    patients,
    staff,
    today,
    loading,
    error,
    reload,
    addTreatment,
    updateTreatment,
  } = useStore();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Treatment | null>(null);

  const dentists = staff.filter((s) => s.role === 'DENTIST' || s.role === 'OWNER');

  /* ---------------- create form ---------------- */

  const [form, setForm] = useState({
    patientId: '',
    dentistId: '',
    type: '',
    category: CATEGORIES[0],
    price: '',
    startDate: today,
    expectedCompletion: addDays(today, 30),
    notes: '',
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return treatments.filter((treatment) => {
      if (status !== 'ALL' && treatment.status !== status) return false;
      if (!q) return true;
      return (
        treatment.patientName.toLowerCase().includes(q) ||
        treatment.type.toLowerCase().includes(q) ||
        treatment.category.toLowerCase().includes(q)
      );
    });
  }, [treatments, query, status]);

  const stats = useMemo(
    () => ({
      open: treatments.filter((t) => t.status === 'IN PROGRESS').length,
      proposed: treatments.filter((t) => t.status === 'PROPOSED').length,
      completed: treatments.filter((t) => t.status === 'COMPLETED').length,
      value: sum(
        treatments
          .filter((t) => t.status !== 'CANCELLED')
          .map((t) => t.price),
      ),
    }),
    [treatments],
  );

  const onCreate = (event: React.FormEvent) => {
    event.preventDefault();

    const patient = patients.find((p) => p.id === form.patientId) ?? patients[0];
    const dentist = staff.find((s) => s.id === form.dentistId) ?? dentists[0];
    if (!patient || !dentist || !form.type.trim()) return;

    const labels = STEP_TEMPLATES[form.category] ?? STEP_TEMPLATES['General dentistry'];

    const treatment: Treatment = {
      id: createId('trt'),
      clinicId: clinic.id,
      patientId: patient.id,
      patientName: patient.fullName,
      dentistId: dentist.id,
      dentistName: dentist.fullName,
      type: form.type.trim(),
      category: form.category,
      teeth: [],
      startDate: form.startDate,
      expectedCompletion: form.expectedCompletion,
      price: Number(form.price) || 0,
      status: 'PROPOSED',
      steps: labels.map((label, i) => ({
        id: createId('step'),
        label,
        date: i === 0 ? form.startDate : null,
        status: i === 0 ? 'ACTIVE' : 'PENDING',
        note: '',
      })),
      notes: form.notes,
    };

    addTreatment(treatment);
    setCreateOpen(false);
    setForm((current) => ({ ...current, type: '', price: '', notes: '' }));
    toast({
      title: 'TREATMENT CREATED',
      description: `${treatment.type} proposed for ${patient.fullName}.`,
    });
  };

  const onAdvance = (treatment: Treatment) => {
    const activeIndex = treatment.steps.findIndex((s) => s.status === 'ACTIVE');
    if (activeIndex < 0) return;

    const steps = treatment.steps.map((step, i) => {
      if (i < activeIndex) return step;
      if (i === activeIndex) return { ...step, status: 'DONE' as const, date: today };
      if (i === activeIndex + 1)
        return { ...step, status: 'ACTIVE' as const, date: today };
      return step;
    });

    const finished = activeIndex === treatment.steps.length - 1;
    const updated: Treatment = {
      ...treatment,
      steps,
      status: finished ? 'COMPLETED' : 'IN PROGRESS',
    };

    updateTreatment(updated);
    setDetail(updated);
    toast({
      title: finished ? 'TREATMENT COMPLETED' : 'STAGE COMPLETED',
      description: `${treatment.patientName} · ${treatment.type}.`,
    });
  };

  const onStatusChange = (treatment: Treatment, next: TreatmentStatus) => {
    const updated = { ...treatment, status: next };
    updateTreatment(updated);
    setDetail(updated);
    toast({
      title: 'TREATMENT UPDATED',
      description: `Marked as ${next.toLowerCase()}.`,
    });
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="cards" rows={6} label="Loading treatments" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            TREATMENT PLANS
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            {stats.open} in progress · {stats.proposed} awaiting acceptance
          </p>
        </div>

        <ChamferButton
          size="sm"
          onClick={() => {
            setForm((current) => ({
              ...current,
              patientId: current.patientId || patients[0]?.id || '',
              dentistId: current.dentistId || dentists[0]?.id || '',
            }));
            setCreateOpen(true);
          }}
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          NEW TREATMENT
        </ChamferButton>
      </div>

      {/* ---------------- stats ---------------- */}
      <div className="grid grid-cols-2 gap-px border border-[rgba(43,48,51,0.12)] bg-[rgba(43,48,51,0.1)] sm:grid-cols-4">
        {[
          { label: 'IN PROGRESS', value: String(stats.open) },
          { label: 'PROPOSED', value: String(stats.proposed) },
          { label: 'COMPLETED', value: String(stats.completed) },
          { label: 'PLANNED VALUE', value: formatCurrency(stats.value) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white px-4 py-3.5">
            <div className="dt-label text-[8.5px]">{stat.label}</div>
            <div className="dt-mono mt-1.5 text-[19px] font-bold leading-none text-[#1A1C1E]">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- filters ---------------- */}
      <div className="flex flex-wrap items-center gap-3 border border-[rgba(43,48,51,0.12)] bg-white p-3.5">
        <SearchInput
          label="Search treatments"
          placeholder="Search by patient, treatment or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          containerClassName="min-w-[220px] flex-1"
        />
        <SelectInput
          label=""
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={[
            { value: 'ALL', label: 'ALL STATUSES' },
            ...STATUSES.map((s) => ({ value: s, label: s })),
          ]}
          className="w-auto min-w-[150px] text-[11px] font-bold uppercase tracking-[0.08em]"
        />
        <TechnicalLabel
          label="RESULTS"
          value={String(filtered.length)}
          className="ml-auto hidden sm:inline-flex"
        />
      </div>

      {/* ---------------- list ---------------- */}
      {filtered.length === 0 ? (
        <div className="border border-[rgba(43,48,51,0.12)] bg-white">
          <EmptyState
            title="NO TREATMENTS"
            description={
              query || status !== 'ALL'
                ? 'No treatment plans match the current filters.'
                : 'No treatment has been planned yet.'
            }
            icon={FileText}
            actionLabel="NEW TREATMENT"
            onAction={() => setCreateOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((treatment) => (
            <article
              key={treatment.id}
              className="border border-[rgba(43,48,51,0.12)] bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[15px] font-bold uppercase tracking-[0.04em] text-[#2B3033]">
                      {treatment.type}
                    </h3>
                    <StatusPill
                      label={treatment.status}
                      tone={treatmentTone(treatment.status)}
                      size="xs"
                    />
                  </div>

                  <p className="mt-2 text-[12px] text-[#6B6F72]">
                    <Link
                      href={`/dashboard/patients/${treatment.patientId}`}
                      className="font-bold text-[#2B3033] hover:text-[#0FA3C2]"
                    >
                      {treatment.patientName}
                    </Link>
                    {' · '}
                    {treatment.dentistName}
                    {' · '}
                    {treatment.category}
                  </p>

                  <p className="dt-mono mt-1 text-[11px] text-[#6B6F72]">
                    {formatDate(treatment.startDate)} →{' '}
                    {formatDate(treatment.expectedCompletion)}
                    {treatment.teeth.length > 0 &&
                      ` · TEETH ${treatment.teeth.join(', ')}`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="dt-mono text-[18px] font-bold text-[#1A1C1E]">
                    {formatCurrency(treatment.price)}
                  </span>
                  <ChamferButton
                    size="xs"
                    variant="secondary"
                    onClick={() => setDetail(treatment)}
                  >
                    MANAGE
                  </ChamferButton>
                </div>
              </div>

              <div className="mt-5 border-t border-[rgba(43,48,51,0.08)] pt-5">
                <TreatmentTimeline steps={treatment.steps} />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ---------------- create modal ---------------- */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="NEW TREATMENT PLAN"
        eyebrow="TREATMENTS"
        size="md"
        footer={
          <>
            <ChamferButton
              variant="secondary"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              CANCEL
            </ChamferButton>
            <ChamferButton size="sm" type="submit" form="treatment-form">
              CREATE PLAN
            </ChamferButton>
          </>
        }
      >
        <form id="treatment-form" onSubmit={onCreate} className="space-y-4">
          <SelectInput
            label="PATIENT"
            value={form.patientId}
            onChange={(event) =>
              setForm({ ...form, patientId: event.target.value })
            }
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.fullName} · ${p.fileNumber}`,
            }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="DENTIST"
              value={form.dentistId}
              onChange={(event) =>
                setForm({ ...form, dentistId: event.target.value })
              }
              options={dentists.map((d) => ({ value: d.id, label: d.fullName }))}
            />
            <SelectInput
              label="CATEGORY"
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <TextInput
            label="TREATMENT TYPE"
            required
            placeholder="e.g. Zirconia crown — 16"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="START DATE"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm({ ...form, startDate: event.target.value })
              }
            />
            <TextInput
              label="EXPECTED COMPLETION"
              type="date"
              value={form.expectedCompletion}
              onChange={(event) =>
                setForm({ ...form, expectedCompletion: event.target.value })
              }
            />
            <TextInput
              label="PRICE (€)"
              type="number"
              min={0}
              step={10}
              placeholder="0"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </div>

          <TextArea
            label="NOTES"
            rows={3}
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />

          <p className="border-t border-[rgba(43,48,51,0.1)] pt-4 text-[11px] leading-[1.6] text-[#6B6F72]">
            A staged timeline is generated from the category:{' '}
            <span className="font-bold text-[#2B3033]">
              {(STEP_TEMPLATES[form.category] ?? []).join(' → ')}
            </span>
          </p>
        </form>
      </Modal>

      {/* ---------------- detail modal ---------------- */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.type ?? ''}
        eyebrow={detail?.patientName ?? ''}
        size="md"
      >
        {detail && (
          <div className="space-y-5">
            <TreatmentTimeline steps={detail.steps} orientation="vertical" />

            <div className="border-t border-[rgba(43,48,51,0.1)] pt-4">
              <span className="dt-field-label">STATUS</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onStatusChange(detail, option)}
                    className={cn(
                      'dt-chamfer-xs border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                      detail.status === option
                        ? 'border-[#0FA3C2] bg-[#15BCDF] text-[#1A1C1E]'
                        : 'border-[rgba(43,48,51,0.16)] bg-white text-[#6B6F72] hover:border-[#15BCDF]',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {detail.steps.some((s) => s.status === 'ACTIVE') && (
              <ChamferButton size="sm" fullWidth onClick={() => onAdvance(detail)}>
                COMPLETE CURRENT STAGE
              </ChamferButton>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(43,48,51,0.1)] pt-4">
              <TechnicalLabel label="VALUE" value={formatCurrency(detail.price)} />
              <Link
                href={`/dashboard/patients/${detail.patientId}`}
                className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0FA3C2] hover:text-[#15BCDF]"
              >
                OPEN PATIENT RECORD
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
