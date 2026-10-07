'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  Package,
  Users,
} from 'lucide-react';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Miniature bar series for the revenue block. */
const REVENUE_BARS = [38, 52, 46, 64, 58, 72, 61, 79, 68, 84, 76, 92];

const SCHEDULE = [
  { time: '09:00', patient: 'CAMILLE DUBOIS', treatment: 'Scaling', state: 'confirmed' },
  { time: '09:45', patient: 'MEHDI TAZI', treatment: 'Root canal', state: 'confirmed' },
  { time: '11:00', patient: 'SARAH BENALI', treatment: 'Crown fitting', state: 'active' },
  { time: '14:00', patient: 'OMAR ZIANI', treatment: 'Implant review', state: 'scheduled' },
  { time: '15:30', patient: 'LEILA SAADI', treatment: 'Aligner review', state: 'scheduled' },
];

const STOCK = [
  { name: 'NITRILE GLOVES M', level: 24, critical: true },
  { name: 'COMPOSITE A3', level: 42, critical: true },
  { name: 'ARTICAINE 4%', level: 78, critical: false },
  { name: 'STERILISATION POUCHES', level: 92, critical: false },
];

export function ClinicOperations() {
  return (
    <section
      id="operations"
      aria-labelledby="operations-heading"
      className="relative w-full overflow-hidden bg-[#F2F1F0]"
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
          <TechnicalLabel label="CLINIC OPERATIONS" value="04" className="mb-6" />

          <SectionHeading
            id="operations-heading"
            fontSize="clamp(38px, 6.5vw, 78px)"
            lines={[
              { text: 'RUN' },
              { text: 'YOUR' },
              { text: 'CLINIC', accent: true, indent: 'min(160px, 18vw)' },
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
            Schedule, stock and revenue in one operational view — the numbers
            that decide whether a clinic day runs well, in front of you before
            it starts.
          </p>
        </motion.div>

        {/* ---------- Asymmetric operations grid ---------- */}
        <div className="mt-16 grid gap-3 lg:grid-cols-12">
          {/* Appointments — large */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="dt-chamfer-sm border border-[rgba(43,48,51,0.12)] bg-white lg:col-span-7 lg:row-span-2"
          >
            <header className="flex items-center justify-between gap-4 border-b border-[rgba(43,48,51,0.1)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <CalendarDays size={15} strokeWidth={1.5} className="text-[#6B6F72]" />
                <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
                  APPOINTMENTS
                </h3>
              </div>
              <TechnicalLabel label="TODAY" value="24" dot />
            </header>

            <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
              {SCHEDULE.map((item) => (
                <li
                  key={item.time}
                  className={cn(
                    'flex items-center gap-4 px-5 py-3.5 transition-colors',
                    item.state === 'active' && 'bg-[rgba(21,188,223,0.06)]',
                  )}
                >
                  <span
                    className={cn(
                      'h-7 w-[2px] shrink-0',
                      item.state === 'active'
                        ? 'bg-[#15BCDF]'
                        : item.state === 'confirmed'
                          ? 'bg-[#0FA3C2]/40'
                          : 'bg-[rgba(43,48,51,0.16)]',
                    )}
                    aria-hidden="true"
                  />
                  <span className="dt-mono w-12 shrink-0 text-[12px] font-bold text-[#1A1C1E]">
                    {item.time}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-bold tracking-[0.04em] text-[#2B3033]">
                    {item.patient}
                  </span>
                  <span className="hidden truncate text-[11px] text-[#6B6F72] sm:block">
                    {item.treatment}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="border-t border-[rgba(43,48,51,0.1)] px-5 py-3.5">
              <TechnicalLabel label="CHAIR UTILISATION" value="78%" />
            </footer>
          </motion.article>

          {/* Revenue */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
            className="dt-chamfer-sm flex flex-col border border-[rgba(43,48,51,0.12)] bg-[#1A1C1E] p-5 lg:col-span-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  MONTHLY REVENUE
                </div>
                <div className="dt-mono mt-2.5 text-[34px] font-bold leading-none text-white">
                  €18,420
                </div>
              </div>
              <ChartNoAxesCombined
                size={16}
                strokeWidth={1.4}
                className="text-white/40"
                aria-hidden="true"
              />
            </div>

            {/* Bar series */}
            <div className="mt-7 flex h-[74px] items-end gap-[3px]" aria-hidden="true">
              {REVENUE_BARS.map((height, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.03, ease: EASE }}
                  className={cn(
                    'flex-1',
                    i === REVENUE_BARS.length - 1 ? 'bg-[#15BCDF]' : 'bg-white/18',
                  )}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <TechnicalLabel label="VS LAST MONTH" value="+12.4%" tone="dark" />
              <TechnicalLabel label="DATA" value="SYNCHRONIZED" tone="dark" dot />
            </div>
          </motion.article>

          {/* Inventory */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
            className="dt-chamfer-sm border border-[rgba(43,48,51,0.12)] bg-white lg:col-span-5"
          >
            <header className="flex items-center justify-between gap-4 border-b border-[rgba(43,48,51,0.1)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Package size={15} strokeWidth={1.5} className="text-[#6B6F72]" />
                <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
                  INVENTORY
                </h3>
              </div>
              <TechnicalLabel label="LOW" value="7" />
            </header>

            <ul className="space-y-3.5 px-5 py-4">
              {STOCK.map((item) => (
                <li key={item.name}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[11px] font-bold tracking-[0.06em] text-[#2B3033]">
                      {item.name}
                    </span>
                    <span className="dt-mono shrink-0 text-[11px] font-bold text-[#6B6F72]">
                      {item.level}%
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-[3px] w-full bg-[rgba(43,48,51,0.09)]"
                    aria-hidden="true"
                  >
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className={cn(
                        'block h-full',
                        item.critical ? 'bg-[#C4841A]' : 'bg-[#15BCDF]',
                      )}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </motion.article>

          {/* Patients strip */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            className="dt-chamfer-sm grid grid-cols-2 gap-px border border-[rgba(43,48,51,0.12)] bg-[rgba(43,48,51,0.1)] sm:grid-cols-4 lg:col-span-12"
          >
            {[
              { icon: Users, label: 'PATIENTS', value: '1,284' },
              { icon: Activity, label: 'TREATMENTS', value: '38 OPEN' },
              { icon: CalendarDays, label: 'NO-SHOW RATE', value: '4.2%' },
              { icon: Package, label: 'STOCK VALUE', value: '€6,940' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white px-5 py-5">
                <Icon
                  size={15}
                  strokeWidth={1.4}
                  className="text-[#6B6F72]"
                  aria-hidden="true"
                />
                <div className="dt-label mt-3.5 text-[9px]">{label}</div>
                <div className="dt-mono mt-1.5 text-[19px] font-bold leading-none text-[#1A1C1E]">
                  {value}
                </div>
              </div>
            ))}
          </motion.article>
        </div>
      </div>
    </section>
  );
}
