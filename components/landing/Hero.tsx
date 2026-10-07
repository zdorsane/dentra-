'use client';

import { motion } from 'framer-motion';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { ToothVisual } from '@/components/three/ToothVisual';
import { cn } from '@/lib/utils';

/* ============================================================
   FLOATING DATA PANELS
   ============================================================ */

interface PanelSpec {
  label: string;
  value: string;
  /** Position within the visual column. */
  style: React.CSSProperties;
  delay: number;
  /** Panels that would overflow are dropped on small screens. */
  hideOnMobile?: boolean;
}

const PANELS: PanelSpec[] = [
  {
    label: 'AI ENGINE',
    value: 'ACTIVE',
    style: { top: '14%', left: '2%' },
    delay: 0.9,
  },
  {
    label: 'PATIENTS',
    value: '1,284',
    style: { top: '30%', right: '3%' },
    delay: 1.05,
  },
  {
    label: 'APPOINTMENTS',
    value: '24 TODAY',
    style: { bottom: '26%', left: '0%' },
    delay: 1.2,
    hideOnMobile: true,
  },
  {
    label: 'SYSTEM',
    value: 'ONLINE',
    style: { bottom: '13%', right: '7%' },
    delay: 1.35,
    hideOnMobile: true,
  },
];

function DataPanel({ panel }: { panel: PanelSpec }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: panel.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'absolute z-20 select-none',
        panel.hideOnMobile && 'hidden sm:block',
      )}
      style={panel.style}
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 5 + panel.delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="border border-[rgba(43,48,51,0.12)] bg-white/55 backdrop-blur-[8px]"
        style={{ padding: '12px 16px' }}
      >
        <div className="text-[9px] font-bold uppercase leading-none tracking-[0.18em] text-[#6B6F72]">
          {panel.label}
        </div>
        <div className="dt-mono mt-1.5 flex items-center gap-1.5 text-[13px] font-bold leading-none text-[#1A1C1E]">
          <span className="h-[5px] w-[5px] bg-[#15BCDF]" />
          {panel.value}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   HERO
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Staircase headline. The final two lines step inward. */
const HEADLINE = [
  { text: 'MANAGE', indent: false },
  { text: 'YOUR', indent: false },
  { text: 'DENTAL', indent: false },
  { text: 'CLINIC', indent: true },
  { text: 'SMARTER', indent: true, accent: true },
];

const PAD_LEFT = 'clamp(20px, 9vw, 118px)';

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#F2F1F0]"
      style={{ minHeight: '100svh' }}
      aria-labelledby="hero-heading"
    >
      {/* Faint technical grid */}
      <div
        className="dt-grid-lines pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-80px)] w-full max-w-shell flex-col-reverse items-stretch gap-8 pb-16 pt-4 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-0 min-[700px]:pb-0 min-[700px]:pt-0">
        {/* ---------- Text column ---------- */}
        <div
          className="relative z-10 flex w-full flex-col justify-center min-[700px]:w-[56%]"
          style={{ paddingLeft: PAD_LEFT, paddingRight: 20 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <TechnicalLabel label="SYSTEM" value="01" />
            <TechnicalLabel label="AI ENGINE" value="ACTIVE" dot />
          </motion.div>

          <h1
            id="hero-heading"
            className="dt-stair text-[#2B3033]"
            style={{
              fontSize: 'min(clamp(42px, 7.6vw, 96px), 9.2vh)',
            }}
          >
            {HEADLINE.map((line, i) => (
              <motion.span
                key={line.text}
                className={cn('block', line.indent && 'dt-hero-line-indent')}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.09, duration: 0.6, ease: EASE }}
                style={{ color: line.accent ? '#15BCDF' : undefined }}
              >
                {line.text}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.55, ease: EASE }}
            className="dt-hero-indent mt-7 leading-[1.7] text-[#6B6F72]"
            style={{
              maxWidth: 500,
              fontSize: 'clamp(14px, 1.6vw, 17px)',
            }}
          >
            One intelligent platform for patients, appointments, inventory and
            clinic operations.
          </motion.p>

          {/* CTA aligns with the indented portion of the headline on desktop. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: 0.55, ease: EASE }}
            className="dt-hero-indent mt-9 flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <ChamferButton href="/register">GET STARTED</ChamferButton>
              <ChamferButton href="/dashboard" variant="secondary">
                WATCH DEMO
              </ChamferButton>
            </div>

            {/* Trailing technical line */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
              aria-hidden="true"
            >
              <span className="flex items-center gap-0">
                <span className="h-[3px] w-[3px] bg-[#15BCDF]" />
                <span className="h-px w-10 bg-[rgba(43,48,51,0.18)]" />
              </span>
              <TechnicalLabel label="UPTIME" value="99.9%" />
              <TechnicalLabel label="VERSION" value="1.0.0" />
            </div>
          </motion.div>
        </div>

        {/* ---------- Visual column ---------- */}
        <div className="relative z-0 w-full min-[700px]:absolute min-[700px]:inset-y-0 min-[700px]:right-0 min-[700px]:w-[52%]">
          <div className="relative h-[46svh] w-full min-[700px]:h-full min-[700px]:min-h-[100svh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE }}
              className="absolute inset-0"
            >
              <ToothVisual />
            </motion.div>

            {PANELS.map((panel) => (
              <DataPanel key={panel.label} panel={panel} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[rgba(43,48,51,0.1)]"
        aria-hidden="true"
      />
    </section>
  );
}
