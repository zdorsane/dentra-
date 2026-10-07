'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

import { AI_DISCLAIMER } from '@/lib/ai';
import type { InventoryInsight } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface AIInsightPanelProps {
  insights: InventoryInsight[];
  title?: string;
  /** Link rendered in the panel footer. */
  href?: string;
  hrefLabel?: string;
  className?: string;
  showDisclaimer?: boolean;
}

const SEVERITY_ACCENT: Record<InventoryInsight['severity'], string> = {
  INFO: 'border-[#15BCDF]/45',
  WARNING: 'border-[#C4841A]/70',
  CRITICAL: 'border-[#B03A34]/70',
};

const SEVERITY_TEXT: Record<InventoryInsight['severity'], string> = {
  INFO: 'text-[#15BCDF]',
  WARNING: 'text-[#D69E2E]',
  CRITICAL: 'text-[#E06B64]',
};

/**
 * Dark AI surface. Insights are derived from live clinic figures, so the
 * narrative always matches whatever table sits next to it.
 */
export function AIInsightPanel({
  insights,
  title = 'AI INSIGHTS',
  href = '/dashboard/ai',
  hrefLabel = 'OPEN DENTRA AI',
  className,
  showDisclaimer = true,
}: AIInsightPanelProps) {
  return (
    <section
      className={cn(
        'dt-chamfer-sm flex flex-col border border-white/10 bg-[#1A1C1E]',
        className,
      )}
      aria-labelledby="ai-insights-title"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="dt-chamfer-xs flex h-7 w-7 items-center justify-center bg-[#15BCDF]">
            <BrainCircuit size={14} strokeWidth={1.7} className="text-[#1A1C1E]" />
          </span>
          <h2
            id="ai-insights-title"
            className="text-[12px] font-bold uppercase tracking-[0.12em] text-white"
          >
            {title}
          </h2>
        </div>

        <span className="flex items-center gap-1.5">
          <span className="dt-dot-pulse h-[5px] w-[5px] bg-[#15BCDF]" aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">
            ACTIVE
          </span>
        </span>
      </header>

      <div className="flex-1 space-y-4 px-5 py-5">
        {insights.length === 0 ? (
          <p className="text-[12px] leading-[1.6] text-white/45">
            Nothing needs attention right now. DENTRA AI will surface stock,
            recall and billing issues here as they appear.
          </p>
        ) : (
          insights.map((insight, i) => (
            <motion.article
              key={insight.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className={cn('border-l-2 pl-3.5', SEVERITY_ACCENT[insight.severity])}
            >
              <div
                className={cn(
                  'dt-mono text-[10px] font-bold tracking-[0.14em]',
                  SEVERITY_TEXT[insight.severity],
                )}
              >
                {insight.metric}
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.6] text-white/70">
                {insight.body}
              </p>
            </motion.article>
          ))
        )}
      </div>

      <footer className="border-t border-white/10 px-5 py-4">
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#15BCDF] transition-colors hover:text-[#3FD0EF]"
          >
            {hrefLabel}
            <ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
          </Link>
        )}

        {showDisclaimer && (
          <p className="mt-3 text-[9.5px] leading-[1.6] text-white/30">
            {AI_DISCLAIMER}
          </p>
        )}
      </footer>
    </section>
  );
}
