'use client';

import { Check } from 'lucide-react';

import { cn, formatDateShort } from '@/lib/utils';
import type { TreatmentStep } from '@/types';

interface TreatmentTimelineProps {
  steps: TreatmentStep[];
  /** Vertical layout reads better inside narrow panels. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Staged treatment plan:
 *
 *   CONSULTATION → DIAGNOSIS → ROOT CANAL → CROWN → FOLLOW-UP
 *
 * Completed steps carry a check, the active step a filled cyan node, and
 * pending steps a hollow outline — so progress never depends on colour alone.
 */
export function TreatmentTimeline({
  steps,
  orientation = 'horizontal',
  className,
}: TreatmentTimelineProps) {
  if (steps.length === 0) return null;

  if (orientation === 'vertical') {
    return (
      <ol className={cn('relative space-y-0', className)}>
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector */}
              {!last && (
                <span
                  className={cn(
                    'absolute left-[8px] top-[18px] h-[calc(100%-10px)] w-px',
                    step.status === 'DONE'
                      ? 'bg-[#15BCDF]'
                      : 'bg-[rgba(43,48,51,0.14)]',
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Node */}
              <span
                className={cn(
                  'relative z-10 mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center border',
                  step.status === 'DONE'
                    ? 'border-[#0FA3C2] bg-[#15BCDF]'
                    : step.status === 'ACTIVE'
                      ? 'border-[#0FA3C2] bg-white'
                      : 'border-[rgba(43,48,51,0.22)] bg-white',
                )}
                aria-hidden="true"
              >
                {step.status === 'DONE' && (
                  <Check size={10} strokeWidth={3} className="text-[#1A1C1E]" />
                )}
                {step.status === 'ACTIVE' && (
                  <span className="dt-dot-pulse h-[7px] w-[7px] bg-[#15BCDF]" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      'text-[12px] font-bold uppercase tracking-[0.06em]',
                      step.status === 'PENDING' ? 'text-[#6B6F72]' : 'text-[#2B3033]',
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="dt-mono text-[10px] text-[#6B6F72]">
                    {step.date ? formatDateShort(step.date) : 'PENDING'}
                  </span>
                </div>
                {step.note && (
                  <p className="mt-1 text-[11px] leading-[1.55] text-[#6B6F72]">
                    {step.note}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={cn('dt-scroll flex gap-0 overflow-x-auto pb-1', className)}
      aria-label="Treatment stages"
    >
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={step.id}
            className="flex min-w-[118px] flex-1 flex-col items-start"
          >
            {/* Node + connector row */}
            <div className="flex w-full items-center">
              <span
                className={cn(
                  'flex h-[17px] w-[17px] shrink-0 items-center justify-center border',
                  step.status === 'DONE'
                    ? 'border-[#0FA3C2] bg-[#15BCDF]'
                    : step.status === 'ACTIVE'
                      ? 'border-[#0FA3C2] bg-white'
                      : 'border-[rgba(43,48,51,0.22)] bg-white',
                )}
                aria-hidden="true"
              >
                {step.status === 'DONE' && (
                  <Check size={10} strokeWidth={3} className="text-[#1A1C1E]" />
                )}
                {step.status === 'ACTIVE' && (
                  <span className="dt-dot-pulse h-[7px] w-[7px] bg-[#15BCDF]" />
                )}
              </span>

              {!last && (
                <span
                  className={cn(
                    'h-px flex-1',
                    step.status === 'DONE'
                      ? 'bg-[#15BCDF]'
                      : 'bg-[rgba(43,48,51,0.14)]',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            <span
              className={cn(
                'mt-3 pr-3 text-[10px] font-bold uppercase leading-[1.35] tracking-[0.08em]',
                step.status === 'PENDING' ? 'text-[#6B6F72]' : 'text-[#2B3033]',
              )}
            >
              {step.label}
            </span>

            <span className="dt-mono mt-1 text-[9px] text-[#9AA0A4]">
              {step.date ? formatDateShort(step.date) : '—'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
