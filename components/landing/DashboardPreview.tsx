'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  FileText,
  Package,
  Settings,
  Users,
} from 'lucide-react';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { ToothIcon } from '@/components/ui/ToothIcon';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { label: 'OVERVIEW', icon: Activity, active: true },
  { label: 'PATIENTS', icon: Users },
  { label: 'APPOINTMENTS', icon: CalendarDays },
  { label: 'TREATMENTS', icon: FileText },
  { label: 'DENTAL CHART', icon: ToothIcon },
  { label: 'INVENTORY', icon: Package },
  { label: 'ANALYTICS', icon: ChartNoAxesCombined },
  { label: 'AI COPILOT', icon: BrainCircuit },
];

const METRICS = [
  { label: "TODAY'S APPOINTMENTS", value: '24' },
  { label: 'ACTIVE PATIENTS', value: '1,284' },
  { label: 'MONTHLY REVENUE', value: '€18,420' },
  { label: 'LOW STOCK ITEMS', value: '7' },
];

const CHART = [42, 58, 51, 67, 60, 74, 66, 82, 71, 88, 79, 94, 85, 92];

export function DashboardPreview() {
  return (
    <section
      aria-labelledby="preview-heading"
      className="relative w-full overflow-hidden bg-[#F2F1F0]"
      style={{
        padding: 'clamp(70px,9vw,130px) clamp(20px,5vw,48px) clamp(80px,10vw,150px)',
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
            <TechnicalLabel label="PRODUCT" value="06" className="mb-6" />
            <SectionHeading
              id="preview-heading"
              fontSize="clamp(38px, 6.5vw, 78px)"
              lines={[
                { text: 'EVERYTHING' },
                { text: 'IN ONE' },
                { text: 'PLACE', accent: true, indent: 'min(120px, 14vw)' },
              ]}
            />
          </div>

          <p
            className="max-w-[420px] leading-[1.7] text-[#6B6F72]"
            style={{ fontSize: 'clamp(14px, 1.6vw, 17px)' }}
          >
            One workspace for the whole practice — the schedule, the register,
            the stock room and the numbers, without switching tools.
          </p>
        </motion.div>

        {/* ---------- Dashboard mock ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.85, ease: EASE }}
          className="dt-chamfer mt-16 overflow-hidden border border-[rgba(43,48,51,0.14)] bg-[#F2F1F0] shadow-[0_40px_80px_-60px_rgba(26,28,30,0.55)]"
          aria-label="Preview of the DENTRA dashboard"
          role="img"
        >
          <div className="flex min-h-[420px] sm:min-h-[540px]">
            {/* Sidebar */}
            <aside className="hidden w-[190px] shrink-0 flex-col bg-[#1A1C1E] py-5 md:flex lg:w-[218px]">
              <div className="mb-7 px-5 text-[17px] font-normal tracking-[-0.5px] text-white">
                DENTRA
              </div>

              <nav className="flex flex-col gap-0.5 px-2.5">
                {NAV.map(({ label, icon: Icon, active }) => (
                  <span
                    key={label}
                    className={cn(
                      'flex h-[34px] items-center gap-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                      active
                        ? 'dt-chamfer-xs bg-[#15BCDF] text-[#1A1C1E]'
                        : 'text-white/45',
                    )}
                  >
                    <Icon size={13} strokeWidth={1.5} aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </nav>

              <div className="mt-auto flex items-center gap-2.5 px-5 pt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
                <Settings size={13} strokeWidth={1.5} aria-hidden="true" />
                SETTINGS
              </div>
            </aside>

            {/* Main */}
            <div className="min-w-0 flex-1">
              {/* Topbar */}
              <div className="flex h-[56px] items-center justify-between gap-4 border-b border-[rgba(43,48,51,0.1)] bg-white px-5">
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
                  OVERVIEW
                </span>
                <div className="flex items-center gap-4">
                  <TechnicalLabel label="CLINIC STATUS" value="ONLINE" dot />
                  <span className="dt-chamfer-xs flex h-7 w-7 items-center justify-center bg-[#1A1C1E] text-[10px] font-bold text-white">
                    AB
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {/* Greeting */}
                <div className="mb-5">
                  <h3
                    className="dt-stair text-[#2B3033]"
                    style={{ fontSize: 'clamp(18px, 2.4vw, 26px)' }}
                  >
                    <span className="block">GOOD MORNING,</span>
                    <span className="block">DR. AMEL</span>
                  </h3>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                  {METRICS.map((metric, i) => (
                    <div
                      key={metric.label}
                      className={cn(
                        'border border-[rgba(43,48,51,0.12)] bg-white p-3.5',
                        i === 0 && 'dt-chamfer-xs relative',
                      )}
                    >
                      {i === 0 && (
                        <span
                          className="absolute right-0 top-0 h-[2px] w-6 bg-[#15BCDF]"
                          aria-hidden="true"
                        />
                      )}
                      <div className="text-[8px] font-bold uppercase leading-tight tracking-[0.14em] text-[#6B6F72]">
                        {metric.label}
                      </div>
                      <div className="dt-mono mt-2.5 text-[20px] font-bold leading-none text-[#1A1C1E] sm:text-[24px]">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Content row */}
                <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.55fr_1fr]">
                  {/* Revenue chart */}
                  <div className="border border-[rgba(43,48,51,0.12)] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
                        REVENUE
                      </span>
                      <TechnicalLabel label="30D" value="+12.4%" />
                    </div>

                    <div
                      className="mt-5 flex h-[100px] items-end gap-[3px] sm:h-[130px]"
                      aria-hidden="true"
                    >
                      {CHART.map((height, i) => (
                        <motion.span
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: 0.3 + i * 0.035,
                            ease: EASE,
                          }}
                          className={cn(
                            'flex-1',
                            i >= CHART.length - 2
                              ? 'bg-[#15BCDF]'
                              : 'bg-[rgba(43,48,51,0.14)]',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* AI insights */}
                  <div className="dt-chamfer-xs border border-white/10 bg-[#1A1C1E] p-4">
                    <div className="flex items-center gap-2">
                      <BrainCircuit
                        size={13}
                        strokeWidth={1.5}
                        className="text-[#15BCDF]"
                        aria-hidden="true"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        AI INSIGHTS
                      </span>
                    </div>

                    <ul className="mt-4 space-y-3">
                      {[
                        'Composite resin reaches minimum stock in ~8 days.',
                        '3 products expire within 30 days.',
                        '12 patients are due a recall.',
                      ].map((text) => (
                        <li
                          key={text}
                          className="border-l-2 border-[#15BCDF]/45 pl-3 text-[11px] leading-[1.55] text-white/65"
                        >
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
