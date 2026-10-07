'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Odontogram } from '@/components/dental/Odontogram';
import { ToothDetailPanel } from '@/components/dental/ToothDetailPanel';
import { TreatmentTimeline } from '@/components/treatments/TreatmentTimeline';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { DataCard } from '@/components/ui/DataCard';
import { TextArea } from '@/components/ui/Form';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { StatusPill } from '@/components/ui/StatusPill';
import { TabPanel, Tabs } from '@/components/ui/Tabs';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/lib/store';
import {
  cn,
  formatCurrency,
  formatDate,
  invoiceTone,
  patientTone,
  treatmentTone,
} from '@/lib/utils';
import type { Tooth } from '@/types';

const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'medical', label: 'MEDICAL HISTORY' },
  { id: 'chart', label: 'DENTAL CHART' },
  { id: 'treatments', label: 'TREATMENTS' },
  { id: 'appointments', label: 'APPOINTMENTS' },
  { id: 'documents', label: 'DOCUMENTS' },
  { id: 'payments', label: 'PAYMENTS' },
  { id: 'notes', label: 'NOTES' },
];

export default function PatientProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { toast } = useToast();

  const {
    patients,
    teeth,
    appointments,
    treatments,
    invoices,
    payments,
    staff,
    today,
    loading,
    error,
    reload,
    updateTooth,
    updatePatient,
  } = useStore();

  const [tab, setTab] = useState('overview');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const patient = useMemo(() => patients.find((p) => p.id === id), [patients, id]);

  const patientTeeth = useMemo(
    () => teeth.filter((t) => t.patientId === id),
    [teeth, id],
  );

  const patientAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.patientId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [appointments, id],
  );

  const patientTreatments = useMemo(
    () => treatments.filter((t) => t.patientId === id),
    [treatments, id],
  );

  const patientInvoices = useMemo(
    () => invoices.filter((i) => i.patientId === id),
    [invoices, id],
  );

  const patientPayments = useMemo(
    () => payments.filter((p) => p.patientId === id),
    [payments, id],
  );

  const activeTooth = useMemo(
    () => patientTeeth.find((t) => t.number === selectedTooth) ?? null,
    [patientTeeth, selectedTooth],
  );

  const dentist = staff.find((s) => s.id === patient?.assignedDentistId);

  /* ---------------- states ---------------- */

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="profile" label="Loading patient" />;

  if (!patient) {
    return (
      <ErrorState
        title="PATIENT NOT FOUND"
        description="This record does not exist, or it belongs to another clinic."
      />
    );
  }

  const onSaveTooth = (tooth: Tooth) => {
    updateTooth(tooth);
    setSelectedTooth(null);
    toast({
      title: 'CHART UPDATED',
      description: `Tooth ${tooth.number} recorded as ${tooth.condition.toLowerCase()}.`,
    });
  };

  const onAddNote = () => {
    if (!noteDraft.trim()) return;
    updatePatient({
      ...patient,
      notes: [
        {
          id: `note_${Date.now()}`,
          author: dentist?.fullName ?? 'Clinical team',
          date: new Date().toISOString(),
          body: noteDraft.trim(),
        },
        ...patient.notes,
      ],
    });
    setNoteDraft('');
    toast({ title: 'NOTE ADDED', description: 'Saved to the patient record.' });
  };

  const balance = patientInvoices
    .filter((i) => i.status !== 'PAID')
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-4">
      {/* ---------------- back ---------------- */}
      <Link
        href="/dashboard/patients"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B6F72] transition-colors hover:text-[#2B3033]"
      >
        <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
        BACK TO PATIENTS
      </Link>

      {/* ---------------- header ---------------- */}
      <header className="dt-chamfer-sm border border-[rgba(43,48,51,0.12)] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-5 p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="dt-chamfer-xs flex h-16 w-16 shrink-0 items-center justify-center bg-[#1A1C1E] text-[19px] font-bold text-white">
              {patient.avatarInitials}
            </span>

            <div className="min-w-0">
              <div className="dt-label text-[9px]">{patient.fileNumber}</div>
              <h2
                className="mt-1.5 truncate text-[#2B3033]"
                style={{
                  fontSize: 'clamp(22px, 3.2vw, 34px)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  lineHeight: 0.98,
                }}
              >
                {patient.fullName}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-[11px] font-bold tracking-[0.04em] text-[#6B6F72]">
                  {patient.age} YEARS · {patient.gender}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B6F72]">
                  <Phone size={11} strokeWidth={1.7} aria-hidden="true" />
                  {patient.phone}
                </span>
                <span className="inline-flex items-center gap-1.5 truncate text-[11px] text-[#6B6F72]">
                  <Mail size={11} strokeWidth={1.7} aria-hidden="true" />
                  {patient.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <StatusPill label={patient.status} tone={patientTone(patient.status)} />
            <div className="flex flex-wrap gap-2">
              <ChamferButton size="xs" variant="secondary" href="/dashboard/appointments">
                BOOK APPOINTMENT
              </ChamferButton>
              <ChamferButton size="xs" onClick={() => setTab('chart')}>
                OPEN CHART
              </ChamferButton>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <dl className="grid grid-cols-2 gap-px border-t border-[rgba(43,48,51,0.1)] bg-[rgba(43,48,51,0.08)] sm:grid-cols-4">
          {[
            { label: 'LAST VISIT', value: formatDate(patient.lastVisit) },
            { label: 'NEXT APPOINTMENT', value: formatDate(patient.nextAppointment) },
            { label: 'TREATMENT', value: patient.primaryTreatment },
            { label: 'BALANCE', value: formatCurrency(balance) },
          ].map((entry) => (
            <div key={entry.label} className="bg-white px-5 py-4">
              <dt className="dt-label text-[9px]">{entry.label}</dt>
              <dd className="mt-1.5 truncate text-[13px] font-bold tracking-[0.02em] text-[#2B3033]">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Medical alerts */}
        {patient.medicalAlerts.length > 0 && (
          <div className="border-t border-[rgba(43,48,51,0.1)] bg-[rgba(176,58,52,0.04)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={14}
                strokeWidth={1.7}
                className="text-[#B03A34]"
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A33A35]">
                MEDICAL ALERTS ({patient.medicalAlerts.length})
              </span>
            </div>

            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {patient.medicalAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className={cn(
                    'border-l-2 pl-3',
                    alert.severity === 'HIGH'
                      ? 'border-[#B03A34]'
                      : alert.severity === 'MEDIUM'
                        ? 'border-[#C4841A]'
                        : 'border-[rgba(43,48,51,0.3)]',
                  )}
                >
                  <span className="block text-[12px] font-bold text-[#2B3033]">
                    {alert.label}
                    <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B6F72]">
                      {alert.severity}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-[1.55] text-[#6B6F72]">
                    {alert.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ---------------- tabs ---------------- */}
      <div className="border border-[rgba(43,48,51,0.12)] bg-white">
        <Tabs
          tabs={TABS.map((t) => ({
            ...t,
            count:
              t.id === 'treatments'
                ? patientTreatments.length
                : t.id === 'appointments'
                  ? patientAppointments.length
                  : t.id === 'documents'
                    ? patient.documents.length
                    : t.id === 'notes'
                      ? patient.notes.length
                      : undefined,
          }))}
          active={tab}
          onChange={setTab}
          idPrefix="patient"
          className="px-2"
        />

        <div className="p-5 sm:p-6">
          {/* ---- OVERVIEW ---- */}
          <TabPanel id="overview" active={tab} idPrefix="patient">
            <div className="grid gap-4 lg:grid-cols-2">
              <DataCard title="PERSONAL DETAILS" eyebrow="IDENTITY">
                <dl className="divide-y divide-[rgba(43,48,51,0.07)]">
                  {[
                    { label: 'DATE OF BIRTH', value: formatDate(patient.dateOfBirth) },
                    { label: 'GENDER', value: patient.gender },
                    { label: 'ADDRESS', value: `${patient.addressLine}, ${patient.city}` },
                    { label: 'COUNTRY', value: patient.country },
                    { label: 'INSURANCE', value: patient.insuranceProvider },
                    { label: 'POLICY NUMBER', value: patient.insuranceNumber },
                    { label: 'ASSIGNED DENTIST', value: dentist?.fullName ?? '—' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <dt className="dt-label text-[9px]">{row.label}</dt>
                      <dd className="truncate text-right text-[12px] text-[#2B3033]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </DataCard>

              <div className="space-y-4">
                <DataCard title="CHART SUMMARY" eyebrow="ODONTOGRAM">
                  <ul className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ['HEALTHY', 'STABLE'],
                        ['TREATMENT REQUIRED', 'ACTION'],
                        ['IN TREATMENT', 'ACTIVE'],
                        ['TREATED', 'COMPLETE'],
                      ] as const
                    ).map(([status, caption]) => (
                      <li
                        key={status}
                        className="border border-[rgba(43,48,51,0.1)] px-3.5 py-3"
                      >
                        <div className="dt-label text-[8.5px]">{caption}</div>
                        <div className="dt-mono mt-1.5 text-[20px] font-bold leading-none text-[#1A1C1E]">
                          {
                            patientTeeth.filter((t) =>
                              status === 'HEALTHY'
                                ? t.condition === 'HEALTHY'
                                : t.status === status,
                            ).length
                          }
                        </div>
                      </li>
                    ))}
                  </ul>

                  <ChamferButton
                    size="xs"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => setTab('chart')}
                  >
                    OPEN DENTAL CHART
                  </ChamferButton>
                </DataCard>

                <DataCard title="UPCOMING" eyebrow="SCHEDULE" padded={false}>
                  {patientAppointments.filter((a) => a.date >= today).length === 0 ? (
                    <EmptyState
                      title="NO UPCOMING VISITS"
                      description="This patient has no future appointment booked."
                      icon={CalendarDays}
                      compact
                    />
                  ) : (
                    <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
                      {patientAppointments
                        .filter((a) => a.date >= today)
                        .slice(0, 3)
                        .map((appointment) => (
                          <li key={appointment.id} className="px-1">
                            <AppointmentCard appointment={appointment} compact />
                          </li>
                        ))}
                    </ul>
                  )}
                </DataCard>
              </div>
            </div>
          </TabPanel>

          {/* ---- MEDICAL HISTORY ---- */}
          <TabPanel id="medical" active={tab} idPrefix="patient">
            {patient.medicalHistory.length === 0 ? (
              <EmptyState
                title="NO MEDICAL HISTORY"
                description="Nothing has been recorded for this patient yet."
                icon={AlertTriangle}
              />
            ) : (
              <ul className="space-y-3">
                {patient.medicalHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex gap-4 border border-[rgba(43,48,51,0.1)] p-4"
                  >
                    <span className="dt-chamfer-xs flex h-8 shrink-0 items-center bg-[#F7F6F8] px-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B6F72]">
                      {entry.category}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-[13px] font-bold text-[#2B3033]">
                          {entry.label}
                        </span>
                        <span className="dt-mono text-[10px] text-[#6B6F72]">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-[1.6] text-[#6B6F72]">
                        {entry.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>

          {/* ---- DENTAL CHART ---- */}
          <TabPanel id="chart" active={tab} idPrefix="patient">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
                  ODONTOGRAM
                </h3>
                <p className="mt-1.5 text-[12px] text-[#6B6F72]">
                  Select any tooth to record its condition, treatment and notes.
                </p>
              </div>
              <TechnicalLabel label="NOTATION" value="FDI" dot />
            </div>

            <Odontogram
              teeth={patientTeeth}
              selectedNumber={selectedTooth}
              onSelect={setSelectedTooth}
            />

            <ToothDetailPanel
              tooth={activeTooth}
              onClose={() => setSelectedTooth(null)}
              onSave={onSaveTooth}
            />
          </TabPanel>

          {/* ---- TREATMENTS ---- */}
          <TabPanel id="treatments" active={tab} idPrefix="patient">
            {patientTreatments.length === 0 ? (
              <EmptyState
                title="NO TREATMENT PLANS"
                description="No treatment has been planned for this patient."
                icon={FileText}
                actionLabel="CREATE TREATMENT"
                actionHref="/dashboard/treatments"
              />
            ) : (
              <div className="space-y-4">
                {patientTreatments.map((treatment) => (
                  <article
                    key={treatment.id}
                    className="border border-[rgba(43,48,51,0.1)] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#2B3033]">
                          {treatment.type}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#6B6F72]">
                          {treatment.category} · {treatment.dentistName} ·{' '}
                          {formatDate(treatment.startDate)} →{' '}
                          {formatDate(treatment.expectedCompletion)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="dt-mono text-[15px] font-bold text-[#1A1C1E]">
                          {formatCurrency(treatment.price)}
                        </span>
                        <StatusPill
                          label={treatment.status}
                          tone={treatmentTone(treatment.status)}
                          size="xs"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <TreatmentTimeline steps={treatment.steps} />
                    </div>

                    {treatment.notes && (
                      <p className="mt-4 border-t border-[rgba(43,48,51,0.08)] pt-3.5 text-[12px] leading-[1.6] text-[#6B6F72]">
                        {treatment.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </TabPanel>

          {/* ---- APPOINTMENTS ---- */}
          <TabPanel id="appointments" active={tab} idPrefix="patient">
            {patientAppointments.length === 0 ? (
              <EmptyState
                title="NO APPOINTMENTS"
                description="This patient has never been scheduled."
                icon={CalendarDays}
                actionLabel="CREATE APPOINTMENT"
                actionHref="/dashboard/appointments"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {patientAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabPanel>

          {/* ---- DOCUMENTS ---- */}
          <TabPanel id="documents" active={tab} idPrefix="patient">
            {patient.documents.length === 0 ? (
              <EmptyState
                title="NO DOCUMENTS"
                description="Radiographs, consent forms and reports will appear here."
                icon={FileText}
                actionLabel="UPLOAD DOCUMENT"
                onAction={() =>
                  toast({
                    title: 'DEMO MODE',
                    description: 'File upload requires a connected backend.',
                    variant: 'info',
                  })
                }
              />
            ) : (
              <ul className="divide-y divide-[rgba(43,48,51,0.07)] border border-[rgba(43,48,51,0.1)]">
                {patient.documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center gap-4 px-4 py-3.5"
                  >
                    <FileText
                      size={15}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#6B6F72]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-bold text-[#2B3033]">
                        {document.name}
                      </div>
                      <div className="dt-mono mt-0.5 text-[10px] text-[#6B6F72]">
                        {document.kind} · {formatDate(document.date)} ·{' '}
                        {(document.sizeKb / 1024).toFixed(1)} MB
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Download ${document.name}`}
                      onClick={() =>
                        toast({
                          title: 'DEMO MODE',
                          description: 'File download requires a connected backend.',
                          variant: 'info',
                        })
                      }
                      className="shrink-0 p-2 text-[#6B6F72] transition-colors hover:text-[#2B3033]"
                    >
                      <Download size={14} strokeWidth={1.6} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>

          {/* ---- PAYMENTS ---- */}
          <TabPanel id="payments" active={tab} idPrefix="patient">
            {patientInvoices.length === 0 ? (
              <EmptyState
                title="NO INVOICES"
                description="Nothing has been billed to this patient."
                icon={Receipt}
                actionLabel="CREATE INVOICE"
                actionHref="/dashboard/billing"
              />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: 'INVOICED',
                      value: formatCurrency(
                        patientInvoices.reduce((acc, i) => acc + i.amount, 0),
                      ),
                    },
                    {
                      label: 'PAID',
                      value: formatCurrency(
                        patientPayments.reduce((acc, p) => acc + p.amount, 0),
                      ),
                    },
                    { label: 'OUTSTANDING', value: formatCurrency(balance) },
                    { label: 'INVOICES', value: String(patientInvoices.length) },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="border border-[rgba(43,48,51,0.1)] px-4 py-3.5"
                    >
                      <div className="dt-label text-[8.5px]">{metric.label}</div>
                      <div className="dt-mono mt-1.5 text-[17px] font-bold leading-none text-[#1A1C1E]">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                <ul className="divide-y divide-[rgba(43,48,51,0.07)] border border-[rgba(43,48,51,0.1)]">
                  {patientInvoices.map((invoice) => (
                    <li
                      key={invoice.id}
                      className="flex flex-wrap items-center gap-4 px-4 py-3.5"
                    >
                      <span className="dt-mono shrink-0 text-[12px] font-bold text-[#1A1C1E]">
                        #{invoice.number}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-[#6B6F72]">
                        {invoice.treatment}
                      </span>
                      <span className="dt-mono shrink-0 text-[10px] text-[#6B6F72]">
                        {formatDate(invoice.issuedDate)}
                      </span>
                      <span className="dt-mono shrink-0 text-[13px] font-bold text-[#1A1C1E]">
                        {formatCurrency(invoice.amount)}
                      </span>
                      <StatusPill
                        label={invoice.status}
                        tone={invoiceTone(invoice.status)}
                        size="xs"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabPanel>

          {/* ---- NOTES ---- */}
          <TabPanel id="notes" active={tab} idPrefix="patient">
            <div className="space-y-5">
              <div>
                <TextArea
                  label="ADD A NOTE"
                  rows={3}
                  value={noteDraft}
                  placeholder="Clinical observation, phone call, or follow-up instruction…"
                  onChange={(event) => setNoteDraft(event.target.value)}
                />
                <ChamferButton
                  size="xs"
                  className="mt-3"
                  disabled={!noteDraft.trim()}
                  onClick={onAddNote}
                >
                  <Plus size={12} strokeWidth={2} aria-hidden="true" />
                  SAVE NOTE
                </ChamferButton>
              </div>

              {patient.notes.length === 0 ? (
                <EmptyState
                  title="NO NOTES"
                  description="Nothing has been recorded for this patient yet."
                  icon={FileText}
                  compact
                />
              ) : (
                <ul className="space-y-3 border-t border-[rgba(43,48,51,0.1)] pt-5">
                  {patient.notes.map((note) => (
                    <li
                      key={note.id}
                      className="border-l-2 border-[#15BCDF]/45 bg-[#F7F6F8] px-4 py-3.5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#2B3033]">
                          {note.author}
                        </span>
                        <span className="dt-mono text-[10px] text-[#6B6F72]">
                          {formatDate(note.date.slice(0, 10))}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] leading-[1.65] text-[#6B6F72]">
                        {note.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabPanel>
        </div>
      </div>

      {/* Address footer */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
        <TechnicalLabel
          label="LOCATION"
          value={`${patient.city.toUpperCase()}, ${patient.country.toUpperCase()}`}
        />
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]">
          <MapPin size={11} strokeWidth={1.7} aria-hidden="true" />
          {patient.addressLine}
        </span>
      </div>
    </div>
  );
}
