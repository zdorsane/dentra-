'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CalendarDays, FileText, Phone } from 'lucide-react';

import { Odontogram } from '@/components/dental/Odontogram';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatusPill } from '@/components/ui/StatusPill';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { patientById, teethForPatient } from '@/lib/mock-data';
import { formatDate, patientTone } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

/** The showcased record — Sarah Benali, mid-crown treatment. */
const PATIENT_ID = 'pat_001';

export function PatientIntelligence() {
  const patient = patientById(PATIENT_ID);
  const teeth = teethForPatient(PATIENT_ID);

  if (!patient) return null;

  const rows = [
    { label: 'AGE', value: String(patient.age) },
    { label: 'LAST VISIT', value: formatDate(patient.lastVisit) },
    { label: 'NEXT APPOINTMENT', value: formatDate(patient.nextAppointment) },
    { label: 'TREATMENT', value: patient.primaryTreatment },
  ];

  return (
    <section
      id="features"
      aria-labelledby="patients-heading"
      className="relative w-full overflow-hidden bg-[#F7F6F8]"
      style={{
        padding: 'clamp(70px,9vw,130px) 0 clamp(70px,9vw,130px) clamp(20px,9vw,118px)',
      }}
    >
      <div className="mx-auto w-full max-w-shell pr-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <TechnicalLabel label="PATIENT INTELLIGENCE" value="03" className="mb-6" />

          <SectionHeading
            id="patients-heading"
            fontSize="clamp(38px, 6.5vw, 78px)"
            lines={[
              { text: 'KNOW' },
              { text: 'YOUR' },
              { text: 'PATIENTS', accent: true, indent: 'min(160px, 18vw)' },
            ]}
          />

          <p
            className="mt-8 leading-[1.7] text-[#6B6F72]"
            style={{
              maxWidth: 520,
              marginLeft: 'min(160px, 18vw)',
              fontSize: 'clamp(14px, 1.6vw, 17px)',
            }}
          >
            Every record carries its full clinical context — medical alerts,
            treatment stage, chart history and the next scheduled visit — so the
            chair is never the place you find out something important.
          </p>
        </motion.div>

        {/* ---------- Patient interface ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-16 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]"
        >
          {/* Profile card */}
          {/* min-w-0: grid items default to min-width:auto, which would size this
              card to its widest child instead of the column, pushing its right
              half outside the section's overflow-hidden on narrow screens. */}
          <div className="dt-chamfer-sm min-w-0 border border-[rgba(43,48,51,0.12)] bg-white">
            <header className="flex items-start justify-between gap-4 border-b border-[rgba(43,48,51,0.1)] px-6 py-5">
              <div className="flex items-center gap-4">
                <span className="dt-chamfer-xs flex h-14 w-14 shrink-0 items-center justify-center bg-[#1A1C1E] text-[16px] font-bold tracking-[0.04em] text-white">
                  {patient.avatarInitials}
                </span>
                <div className="min-w-0">
                  <div className="dt-label text-[9px]">PATIENT</div>
                  <h3 className="mt-1 text-[21px] font-bold uppercase tracking-[0.02em] text-[#2B3033]">
                    {patient.fullName}
                  </h3>
                  <p className="dt-mono mt-1 text-[11px] text-[#6B6F72]">
                    {patient.fileNumber}
                  </p>
                </div>
              </div>

              <StatusPill label="IN PROGRESS" tone={patientTone('IN TREATMENT')} />
            </header>

            {/* Data rows */}
            <dl className="divide-y divide-[rgba(43,48,51,0.08)]">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <dt className="dt-label text-[10px]">{row.label}</dt>
                  <dd className="text-right text-[13px] font-bold tracking-[0.02em] text-[#2B3033]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Medical alert */}
            {patient.medicalAlerts.length > 0 && (
              <div className="mx-6 mb-5 flex items-start gap-3 border-l-[3px] border-[#B03A34] bg-[rgba(176,58,52,0.05)] px-4 py-3.5">
                <AlertTriangle
                  size={15}
                  strokeWidth={1.7}
                  className="mt-[1px] shrink-0 text-[#B03A34]"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A33A35]">
                    MEDICAL ALERT
                  </div>
                  <p className="mt-1 text-[12px] leading-[1.6] text-[#6B6F72]">
                    <span className="font-bold text-[#2B3033]">
                      {patient.medicalAlerts[0].label}.
                    </span>{' '}
                    {patient.medicalAlerts[0].note}
                  </p>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[rgba(43,48,51,0.1)] px-6 py-4">
              {[
                { icon: Phone, label: patient.phone },
                { icon: CalendarDays, label: 'BOOK VISIT' },
                { icon: FileText, label: `${patient.documents.length} DOCUMENTS` },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.06em] text-[#6B6F72]"
                >
                  <Icon size={13} strokeWidth={1.6} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Dental chart */}
          {/* min-w-0 so the odontogram's own overflow-x-auto can take effect;
              without it this grid item stretches to the full 32-tooth width. */}
          <div className="dt-chamfer-sm min-w-0 border border-[rgba(43,48,51,0.12)] bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(43,48,51,0.1)] px-6 py-5">
              <div>
                <div className="dt-label text-[9px]">DENTAL CHART</div>
                <h3 className="mt-1 text-[14px] font-bold uppercase tracking-[0.1em] text-[#2B3033]">
                  ODONTOGRAM / FDI
                </h3>
              </div>
              <TechnicalLabel label="TEETH" value={String(teeth.length)} dot />
            </header>

            <div className="px-4 py-6">
              <Odontogram
                teeth={teeth}
                selectedNumber={16}
                onSelect={() => {}}
                compact
                readOnly
              />
            </div>

            <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgba(43,48,51,0.1)] px-6 py-4">
              <TechnicalLabel label="SELECTED" value="16 · CROWN" />
              <TechnicalLabel label="STATUS" value="IN TREATMENT" />
            </footer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
