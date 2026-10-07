'use client';

import { useCallback, useMemo, useRef } from 'react';

import { ToothShape } from './ToothShape';
import { LOWER_ARCH, UPPER_ARCH } from '@/lib/mock-data';
import { TOOTH_CONDITION_STYLE, cn } from '@/lib/utils';
import type { Tooth, ToothCondition } from '@/types';

interface OdontogramProps {
  teeth: Tooth[];
  selectedNumber: number | null;
  onSelect: (number: number) => void;
  /** Compact mode drops the legend and shrinks the glyphs. */
  compact?: boolean;
  className?: string;
  /** Read-only charts skip the interaction affordances. */
  readOnly?: boolean;
}

const LEGEND_ORDER: ToothCondition[] = [
  'HEALTHY',
  'CARIES',
  'FILLED',
  'CROWN',
  'ROOT CANAL',
  'IMPLANT',
  'FRACTURE',
  'EXTRACTION',
  'MISSING',
];

/**
 * Interactive dental chart in FDI notation.
 *
 * Teeth form a single roving-tabindex group: one Tab stop enters the chart,
 * then arrow keys move between teeth and Enter/Space opens the detail panel.
 */
export function Odontogram({
  teeth,
  selectedNumber,
  onSelect,
  compact = false,
  className,
  readOnly = false,
}: OdontogramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const byNumber = useMemo(() => {
    const map = new Map<number, Tooth>();
    teeth.forEach((tooth) => map.set(tooth.number, tooth));
    return map;
  }, [teeth]);

  const order = useMemo(() => [...UPPER_ARCH, ...LOWER_ARCH], []);
  const size = compact ? 26 : 38;

  const focusTooth = useCallback((number: number) => {
    containerRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tooth="${number}"]`)
      ?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, number: number) => {
      const index = order.indexOf(number);
      if (index < 0) return;

      let next: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          next = order[(index + 1) % order.length];
          break;
        case 'ArrowLeft':
          next = order[(index - 1 + order.length) % order.length];
          break;
        case 'ArrowDown':
          // Jump to the vertically opposite tooth in the other arch.
          next =
            index < UPPER_ARCH.length
              ? LOWER_ARCH[UPPER_ARCH.length - 1 - index]
              : order[index];
          break;
        case 'ArrowUp':
          next =
            index >= UPPER_ARCH.length
              ? UPPER_ARCH[
                  UPPER_ARCH.length - 1 - (index - UPPER_ARCH.length)
                ]
              : order[index];
          break;
        case 'Home':
          next = order[0];
          break;
        case 'End':
          next = order[order.length - 1];
          break;
        default:
          return;
      }

      if (next !== null) {
        event.preventDefault();
        focusTooth(next);
      }
    },
    [order, focusTooth],
  );

  const renderArch = (numbers: number[], arch: 'UPPER' | 'LOWER') => (
    <div className="flex items-start justify-center gap-[2px] sm:gap-1">
      {numbers.map((number, i) => {
        const tooth = byNumber.get(number);
        if (!tooth) return null;

        const selected = selectedNumber === number;
        const isMidline = i === numbers.length / 2;

        return (
          <div key={number} className="flex items-start">
            {/* Midline separator between quadrants */}
            {isMidline && (
              <span
                className="mx-1.5 self-stretch border-l border-dashed border-[rgba(43,48,51,0.2)] sm:mx-2.5"
                aria-hidden="true"
              />
            )}

            <button
              type="button"
              data-tooth={number}
              tabIndex={
                selectedNumber === number || (selectedNumber === null && number === order[0])
                  ? 0
                  : -1
              }
              onClick={() => onSelect(number)}
              onKeyDown={(event) => onKeyDown(event, number)}
              aria-pressed={selected}
              aria-label={`Tooth ${number}, ${tooth.name}, ${tooth.condition.toLowerCase()}${
                tooth.treatment ? `, ${tooth.treatment}` : ''
              }`}
              className={cn(
                'group flex flex-col items-center gap-1 p-1 transition-colors duration-150',
                arch === 'LOWER' && 'flex-col-reverse',
                !readOnly && 'cursor-pointer hover:bg-[rgba(21,188,223,0.07)]',
                readOnly && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'dt-mono text-[9px] font-bold leading-none transition-colors',
                  selected ? 'text-[#0FA3C2]' : 'text-[#6B6F72]',
                )}
              >
                {number}
              </span>

              <ToothShape
                number={number}
                condition={tooth.condition}
                selected={selected}
                flipped={arch === 'LOWER'}
                size={size}
              />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        role="group"
        aria-label="Dental chart, FDI notation"
        className="dt-scroll overflow-x-auto pb-2"
      >
        <div className="mx-auto flex min-w-[660px] flex-col gap-3 px-1 sm:min-w-[760px]">
          {/* Upper arch */}
          <div>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="dt-label text-[9px]">UPPER / MAXILLARY</span>
              <span className="dt-label text-[9px]">
                Q1 <span className="text-[rgba(43,48,51,0.3)]">|</span> Q2
              </span>
            </div>
            {renderArch(UPPER_ARCH, 'UPPER')}
          </div>

          {/* Occlusal plane */}
          <div className="flex items-center gap-0" aria-hidden="true">
            <span className="h-[3px] w-[3px] bg-[#15BCDF]" />
            <span className="h-px flex-1 bg-[rgba(43,48,51,0.14)]" />
            <span className="h-[3px] w-[3px] bg-[#15BCDF]" />
          </div>

          {/* Lower arch */}
          <div>
            {renderArch(LOWER_ARCH, 'LOWER')}
            <div className="mt-1.5 flex items-center justify-between px-1">
              <span className="dt-label text-[9px]">LOWER / MANDIBULAR</span>
              <span className="dt-label text-[9px]">
                Q4 <span className="text-[rgba(43,48,51,0.3)]">|</span> Q3
              </span>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-[rgba(43,48,51,0.1)] pt-5">
          {LEGEND_ORDER.map((condition) => {
            const style = TOOTH_CONDITION_STYLE[condition];
            const count = teeth.filter((t) => t.condition === condition).length;
            return (
              <li
                key={condition}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]"
              >
                <span
                  className="inline-block h-[11px] w-[11px] shrink-0 border"
                  style={{
                    background:
                      condition === 'MISSING' ? 'transparent' : style.fill,
                    borderColor: style.stroke,
                    borderStyle: condition === 'MISSING' ? 'dashed' : 'solid',
                  }}
                  aria-hidden="true"
                />
                {condition}
                <span className="dt-mono text-[#2B3033]">{count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
