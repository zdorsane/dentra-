'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, CalendarDays, Package, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { ToothFallback } from '@/components/three/ToothVisual';

interface Module {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const MODULES: Module[] = [
  {
    number: '01',
    title: 'PATIENTS',
    description:
      'Complete records, medical alerts, dental charts and treatment history in one continuous timeline.',
    icon: Users,
  },
  {
    number: '02',
    title: 'APPOINTMENTS',
    description:
      'Day, week and month scheduling across practitioners and rooms, with confirmation tracking.',
    icon: CalendarDays,
  },
  {
    number: '03',
    title: 'INVENTORY',
    description:
      'Batch, expiry and consumption tracking with automatic reorder thresholds per product.',
    icon: Package,
  },
  {
    number: '04',
    title: 'INTELLIGENCE',
    description:
      'Operational forecasting across stock, recalls and revenue, surfaced before it becomes urgent.',
    icon: BrainCircuit,
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Platform() {
  return (
    <section
      id="platform"
      aria-labelledby="platform-heading"
      className="relative w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #F2F1F0 0%, #F7F6F8 18%, #F7F6F8 100%)',
        padding:
          'clamp(80px,10vw,140px) 0 clamp(40px,5vw,70px) clamp(20px,9vw,118px)',
      }}
    >
      <div className="mx-auto w-full max-w-shell pr-5">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-8">
          {/* ---------- Left: heading ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <TechnicalLabel label="PLATFORM" value="02" className="mb-6" />

            <SectionHeading
              id="platform-heading"
              fontSize="clamp(38px, 6.5vw, 78px)"
              lines={[
                { text: 'YOUR' },
                { text: 'DIGITAL' },
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
              DENTRA connects patients, clinical workflows and business operations
              into one intelligent workspace designed for modern dental practices.
            </p>
          </motion.div>

          {/* ---------- Right: visual ---------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative mx-auto h-[300px] w-full max-w-[460px] sm:h-[400px] lg:h-[480px]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 opacity-90">
              <ToothFallback />
            </div>

            {/* Corner brackets — technical framing */}
            {[
              'left-0 top-0 border-l border-t',
              'right-0 top-0 border-r border-t',
              'left-0 bottom-0 border-l border-b',
              'right-0 bottom-0 border-r border-b',
            ].map((position) => (
              <span
                key={position}
                className={`absolute h-7 w-7 border-[#15BCDF]/45 ${position}`}
              />
            ))}
          </motion.div>
        </div>

        {/* ---------- Modules ---------- */}
        <div className="mt-20 grid border-t border-[rgba(43,48,51,0.12)] sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((module, i) => {
            const Icon = module.icon;
            return (
              <motion.article
                key={module.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className="group relative border-b border-[rgba(43,48,51,0.12)] px-0 py-8 sm:border-r sm:px-7 sm:first:pl-0 lg:last:border-r-0"
              >
                {/* Active indicator */}
                <span
                  className="absolute left-0 top-0 h-[2px] w-0 bg-[#15BCDF] transition-all duration-300 group-hover:w-full sm:left-7 sm:group-hover:w-[calc(100%-56px)]"
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-4">
                  <span className="dt-mono text-[11px] font-bold tracking-[0.18em] text-[#15BCDF]">
                    {module.number}
                  </span>
                  <Icon
                    size={19}
                    strokeWidth={1.3}
                    className="text-[#6B6F72] transition-colors duration-300 group-hover:text-[#15BCDF]"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-6 text-[19px] font-bold uppercase tracking-[0.04em] text-[#2B3033]">
                  {module.title}
                </h3>

                <p className="mt-3 max-w-[300px] text-[13px] leading-[1.7] text-[#6B6F72]">
                  {module.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
