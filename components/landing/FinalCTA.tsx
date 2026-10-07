'use client';

import { motion } from 'framer-motion';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';

const EASE = [0.22, 1, 0.36, 1] as const;

export function FinalCTA() {
  return (
    <section
      id="contact"
      aria-labelledby="cta-heading"
      className="relative w-full overflow-hidden bg-[#1A1C1E]"
      style={{
        padding: 'clamp(80px,11vw,160px) clamp(20px,5vw,48px)',
      }}
    >
      {/* Technical grid, dark variant */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #FFF 1px, transparent 1px), linear-gradient(to bottom, #FFF 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-end"
        >
          <div>
            <TechnicalLabel
              label="GET STARTED"
              value="08"
              tone="dark"
              className="mb-7"
            />

            <SectionHeading
              id="cta-heading"
              tone="dark"
              fontSize="clamp(38px, 7vw, 86px)"
              lines={[
                { text: 'READY' },
                { text: 'TO RUN' },
                { text: 'YOUR CLINIC' },
                { text: 'SMARTER?', accent: true },
              ]}
            />
          </div>

          <div className="lg:pb-4">
            <p
              className="leading-[1.75] text-white/55"
              style={{ maxWidth: 460, fontSize: 'clamp(14px, 1.6vw, 17px)' }}
            >
              Bring your patients, operations and intelligence into one connected
              dental platform.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ChamferButton href="/register">START WITH DENTRA</ChamferButton>
              <ChamferButton href="/login" variant="dark" className="px-8 py-[17px]">
                VIEW THE DEMO
              </ChamferButton>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-white/10 pt-7">
              <TechnicalLabel label="CLINIC STATUS" value="ONLINE" tone="dark" dot />
              <TechnicalLabel label="UPTIME" value="99.9%" tone="dark" />
              <TechnicalLabel label="VERSION" value="1.0.0" tone="dark" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
