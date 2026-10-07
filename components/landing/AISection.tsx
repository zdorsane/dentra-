'use client';

import { motion, useInView } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { AI_DISCLAIMER } from '@/lib/ai';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

const CONVERSATION: ChatTurn[] = [
  { role: 'user', text: 'Which patients need follow-up?' },
  {
    role: 'assistant',
    text: "12 patients haven't had a follow-up appointment in the last 6 months.",
  },
  { role: 'user', text: 'Any inventory alerts?' },
  {
    role: 'assistant',
    text: '7 products are below their minimum stock level.',
  },
];

/** Reveals one turn at a time once the panel scrolls into view. */
function useProgressiveReveal(total: number, active: boolean) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!active) return;

    // Respect reduced motion by revealing everything immediately.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(total);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= total; i += 1) {
      timers.push(setTimeout(() => setShown(i), 500 + i * 900));
    }
    return () => timers.forEach(clearTimeout);
  }, [active, total]);

  return shown;
}

export function AISection() {
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { once: true, margin: '-100px' });
  const shown = useProgressiveReveal(CONVERSATION.length, inView);

  return (
    <section
      id="ai"
      aria-labelledby="ai-heading"
      className="relative w-full overflow-hidden bg-[#F7F6F8]"
      style={{
        padding: 'clamp(70px,9vw,130px) 0 clamp(70px,9vw,130px) clamp(20px,9vw,118px)',
      }}
    >
      <div className="mx-auto w-full max-w-shell pr-5">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          {/* ---------- Left: heading ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <TechnicalLabel label="DENTRA AI" value="05" className="mb-6" />

            <SectionHeading
              id="ai-heading"
              fontSize="clamp(38px, 6.5vw, 78px)"
              lines={[
                { text: 'YOUR' },
                { text: 'CLINIC' },
                { text: 'THINKS', accent: true, indent: 'min(160px, 18vw)' },
                { text: 'AHEAD', accent: true, indent: 'min(160px, 18vw)' },
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
              DENTRA AI reads your clinic&rsquo;s own operational data and answers
              in plain language — recall lists, stock forecasts, revenue and
              open treatment plans, without exporting a single spreadsheet.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
              style={{ marginLeft: 'min(160px, 18vw)' }}
            >
              <TechnicalLabel label="AI ENGINE" value="ACTIVE" dot />
              <TechnicalLabel label="DATA" value="SYNCHRONIZED" />
            </div>
          </motion.div>

          {/* ---------- Right: chat window ---------- */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="dt-chamfer-sm overflow-hidden border border-white/10 bg-[#1A1C1E]"
          >
            {/* Window header */}
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="dt-chamfer-xs flex h-8 w-8 items-center justify-center bg-[#15BCDF]">
                  <BrainCircuit size={16} strokeWidth={1.6} className="text-[#1A1C1E]" />
                </span>
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-white">
                    DENTRA AI
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="dt-dot-pulse h-[5px] w-[5px] bg-[#15BCDF]"
                      aria-hidden="true"
                    />
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">
                      STATUS: ONLINE
                    </span>
                  </div>
                </div>
              </div>
              <TechnicalLabel label="SESSION" value="01" tone="dark" />
            </header>

            {/* Messages */}
            <div
              className="flex min-h-[320px] flex-col gap-4 p-5"
              aria-live="polite"
              aria-atomic="false"
            >
              {CONVERSATION.map((turn, i) => {
                const visible = i < shown;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={cn(
                      'flex flex-col gap-1.5',
                      turn.role === 'user' ? 'items-end' : 'items-start',
                    )}
                    aria-hidden={!visible}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                      {turn.role === 'user' ? 'USER' : 'AI'}
                    </span>

                    <div
                      className={cn(
                        'dt-chamfer-xs max-w-[85%] px-4 py-3 text-[13px] leading-[1.6]',
                        turn.role === 'user'
                          ? 'bg-white/8 text-white/85'
                          : 'border border-[#15BCDF]/35 bg-[#15BCDF]/10 text-white',
                      )}
                    >
                      {turn.text}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator while the next turn is pending */}
              {shown < CONVERSATION.length && (
                <div className="flex items-center gap-1.5 px-1" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-[5px] w-[5px] bg-[#15BCDF]"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: i * 0.18,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer / disclaimer */}
            <footer className="border-t border-white/10 px-5 py-3.5">
              <p className="text-[10px] leading-[1.6] text-white/35">
                {AI_DISCLAIMER}
              </p>
            </footer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
